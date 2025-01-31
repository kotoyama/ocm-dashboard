import {
  CommandInteraction,
  MessageFlags,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js'
import { nanoid } from 'nanoid'

import { db } from '~/db'
import config from '~/config/variables'
import { isAdmin, isMod, isPlayer, withPrivilegeCheck } from '~/middlewares'
import {
  notify,
  plural,
  logAction,
  getMember,
  getTimeoutDuration,
  withDeferredResponse,
} from '~/shared/lib'
import { Violation } from '~/shared/types'

const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Выдать варн')
  .addUserOption((option) =>
    option.setName('user_id').setDescription('Пользователь').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('violation')
      .setDescription('Причина варна')
      .setRequired(true)
      .addChoices(
        Object.entries(config.violations).map(([value, name]) => ({
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
  try {
    const userId = interaction.options.get('user_id', true).value as string
    const violation = interaction.options.get('violation', true)
      .value as Violation
    const details = interaction.options.get('details')?.value as
      | string
      | undefined
      | null

    const initiator = interaction.member as GuildMember
    const guildMember = await getMember(interaction, userId)

    if (!guildMember) {
      return notify(interaction, {
        type: 'error',
        message: 'Пользователь не найден.',
      })
    }

    if (initiator.user.id === userId) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь выдать варн самому себе.',
      })
    }

    if (isAdmin(guildMember) || !isPlayer(guildMember)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь выдать варн этому пользователю.',
      })
    }

    const isTimeouted =
      !!guildMember.communicationDisabledUntilTimestamp &&
      guildMember.communicationDisabledUntilTimestamp !== null &&
      guildMember.communicationDisabledUntilTimestamp >= Date.now()

    if (isTimeouted) {
      return notify(interaction, {
        type: 'error',
        message: `<@${guildMember.user.id}> уже в таймауте.`,
      })
    }

    const warnId = nanoid(10)

    db.run('BEGIN TRANSACTION;')

    db.query(
      'INSERT INTO warns (id, user_id, reason, details) VALUES ($id, $user_id, $reason, $details);',
    ).run({
      $id: warnId,
      $user_id: userId,
      $reason: violation,
      $details: details || null,
    })

    db.run('COMMIT;')

    await logAction(interaction.client, {
      channel: 'modlog',
      action: 'warn',
      user_id: userId,
      moderator_id: initiator.user.id,
      warn_id: warnId,
      violation,
    })

    const [{ count: warnsCount }] = db
      .query(
        'SELECT COUNT(*) AS count FROM warns WHERE user_id = $user_id AND reason = $reason;',
      )
      .all({
        $user_id: userId,
        $reason: violation,
      }) as [{ count: number }]

    const rules = config.sactions[violation]

    if (rules.length > 0) {
      const rule = rules.find((rule) => rule.warns === warnsCount)

      if (rule) {
        await guildMember
          .timeout(rule.timeout)
          .then(() => {
            return notify(interaction, {
              type: 'success',
              message: `<@${guildMember.user.id}> получил варн и был отправлен в таймаут на **${getTimeoutDuration(rule.timeout)}** за ${warnsCount}-е нарушение правила **"${config.violations[violation]}"**.`,
            })
          })
          .catch(() => {
            return notify(interaction, {
              type: 'info',
              message: `Варн для <@${guildMember.user.id}> успешно выдан, однако дать таймаут на **${getTimeoutDuration(rule.timeout)}** не удалось. Возможно, не хватает каких-то прав. Попробуй сделать это вручную.`,
            })
          })
      } else {
        return notify(interaction, {
          type: 'info',
          message: `У <@${guildMember.user.id}> уже **${plural(warnsCount, ['варн', 'варна', 'варнов'])}** за нарушение правила **"${config.violations[violation]}"**. Выбор наказания остаётся за тобой. При необходимости сделай что считаешь нужным вручную.`,
        })
      }
    } else {
      return notify(interaction, {
        type: 'info',
        message: `Варн для <@${guildMember.user.id}> успешно выдан, однако выбор наказания остаётся за тобой. При необходимости сделай что считаешь нужным вручную.`,
      })
    }
  } catch (error) {
    console.error(error)

    if (db.inTransaction) {
      db.run('ROLLBACK;')
    }

    return notify(interaction, {
      type: 'error',
      message:
        'Произошла ошибка при обработке команды. Свяжитесь с автором бота.',
    })
  }
}

const execute = withDeferredResponse(withPrivilegeCheck(handleWarn, isMod), {
  flags: [MessageFlags.Ephemeral],
})

export default { data, execute }
