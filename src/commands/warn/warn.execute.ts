import { CommandInteraction, MessageFlags, GuildMember } from 'discord.js'
import { nanoid } from 'nanoid'

import { db } from '~/db'
import {
  isMod,
  isPlayer,
  notify,
  plural,
  withDeferredResponse,
  withRoleCheck,
} from '~/shared/lib'
import { violationChoices } from '~/shared/ui'
import { Violation } from '~/shared/types'
import sanctions from './sanctions'

async function handleWarn(interaction: CommandInteraction) {
  const userId = interaction.options.get('user_id', true).value as string
  const violation = interaction.options.get('violation', true)
    .value as Violation
  const details = interaction.options.get('details')?.value as
    | string
    | undefined
    | null

  try {
    const guildMember = await interaction.guild?.members.fetch(userId)
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
      'INSERT INTO warns (id, user_id, reason, details) VALUES ($id, $user_id, $reason, $details);',
    ).run({
      $id: nanoid(10),
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

export const execute = withDeferredResponse(withRoleCheck(handleWarn, isMod), {
  flags: [MessageFlags.Ephemeral],
})
