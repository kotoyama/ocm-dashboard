import {
  CommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
  GuildMember,
} from 'discord.js'

import { db } from '~/db'
import {
  isPlayer,
  notify,
  plural,
  withDeferredResponse,
  withModCheck,
} from '~/shared/lib'
import { Violation } from '~/shared/types'
import sanctions from './sanctions'

const violationChoices = {
  [Violation.Respect]: 'Неуважение',
  [Violation.ProhibitedTopics]: 'Запрещённые темы',
  [Violation.InappropriateContent]: 'Неприемлемый контент',
  [Violation.Privacy]: 'Нарушение конфиденциальности',
  [Violation.Other]: 'Другое',
}

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Выдать варн пользователю')
  .addUserOption((option) =>
    option.setName('user_id').setDescription('Пользователь').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('violation')
      .setDescription('Причина варна')
      .setRequired(true)
      .addChoices(
        Object.entries(violationChoices).map(([value, name]) => ({
          name,
          value,
        })),
      ),
  )
  .addStringOption((option) =>
    option
      .setName('details')
      .setDescription('Дополнительная информация')
      .setMaxLength(280),
  )

async function handleWarn(interaction: CommandInteraction) {
  const userId = interaction.options.get('user_id', true).value as string
  const violation = interaction.options.get('violation', true)
    .value as Violation
  const details = interaction.options.get('details')?.value as
    | string
    | undefined
    | null

  try {
    const guildMember = interaction.guild?.members.cache.get(userId)
    const initiator = interaction.member as GuildMember

    if (initiator.user.id === userId) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь выдать варн самому себе.',
      })
    }

    if (!isPlayer(guildMember)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь выдать варн этому пользователю.',
      })
    }

    const isTimeouted =
      !!guildMember?.communicationDisabledUntilTimestamp &&
      guildMember.communicationDisabledUntilTimestamp !== null &&
      guildMember.communicationDisabledUntilTimestamp >= Date.now()

    if (isTimeouted) {
      return notify(interaction, {
        type: 'error',
        message: `Пользователь ${guildMember?.user.username} уже в таймауте.`,
      })
    }

    db.run('BEGIN TRANSACTION;')

    db.query(
      'INSERT INTO warns (user_id, reason, details) VALUES ($user_id, $reason, $details);',
    ).run({
      $user_id: userId,
      $reason: violation,
      $details: details || null,
    })

    db.run('COMMIT;')

    const [{ count: warnsCount }] = db
      .query(
        'SELECT COUNT(*) AS count FROM warns WHERE user_id = $user_id AND reason = $reason;',
      )
      .all({
        $user_id: userId,
        $reason: violation,
      }) as [{ count: number }]

    const rules = sanctions[violation]

    if (rules.length > 0) {
      const rule = rules.find((rule) => rule.warns === warnsCount)

      if (rule) {
        guildMember?.timeout(rule.timeout)

        return notify(interaction, {
          type: 'success',
          message: `Пользователь ${guildMember?.user.username} был отправлен в таймаут на ${rule.label} за ${warnsCount}-е нарушение правила "${violationChoices[violation]}".`,
        })
      } else {
        return notify(interaction, {
          type: 'info',
          message: `У пользователя ${guildMember?.user.username} уже ${plural(warnsCount, ['варн', 'варна', 'варнов'])} за нарушение правила "${violationChoices[violation]}". Выбор наказания остаётся за тобой. При необходимости сделай что считаешь нужным вручную.`,
        })
      }
    } else {
      return notify(interaction, {
        type: 'info',
        message:
          'Варн успешно выдан, однако выбор наказания остаётся за тобой. При необходимости сделай что считаешь нужным вручную.',
      })
    }
  } catch (error) {
    console.error(error)

    db.run('ROLLBACK;')

    return notify(interaction, {
      type: 'error',
      message:
        'Произошла ошибка при обработке команды. Свяжитесь с автором бота.',
    })
  }
}

export const execute = withDeferredResponse(withModCheck(handleWarn), {
  flags: [MessageFlags.Ephemeral],
})
