import {
  CommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js'

import { db } from '~/db'
import type { Warn } from '~/shared/types'
import { isMod, withPrivilegeCheck } from '~/middlewares'
import {
  notify,
  logAction,
  getMember,
  withDeferredResponse,
} from '~/shared/lib'

const data = new SlashCommandBuilder()
  .setName('clearwarn')
  .setDescription('Убрать варн')
  .addStringOption((option) =>
    option.setName('warn_id').setDescription('ID варна').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('Причина')
      .setMaxLength(280)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName('remove_timeout')
      .setDescription(
        'Надо ли снять с пользователя текущий таймаут (если имеется)',
      )
      .setRequired(true),
  )

async function handleClearWarn(interaction: CommandInteraction) {
  try {
    const warnId = interaction.options.get('warn_id', true).value as string
    const reason = interaction.options.get('reason', true).value as string
    const removeTimeout = interaction.options.get('remove_timeout', true)
      .value as boolean

    const [result] = db
      .query('SELECT * FROM warns WHERE id = $warn_id;')
      .all({ $warn_id: warnId })

    if (!result) {
      return notify(interaction, {
        type: 'error',
        message: 'Варн не найден.',
      })
    }

    const warn = result as Warn
    const initiator = interaction.member as GuildMember
    const guildMember = await getMember(interaction, warn.user_id)

    if (!guildMember) {
      return notify(interaction, {
        type: 'error',
        message: 'Пользователь не найден.',
      })
    }

    const { changes } = db
      .query('DELETE FROM warns WHERE id = $warn_id;')
      .run({ $warn_id: warnId })

    if (!changes) {
      return notify(interaction, {
        type: 'error',
        message: 'Варн не найден.',
      })
    }

    await logAction(interaction.client, {
      channel: 'modlog',
      action: 'clear-warn',
      user_id: warn.user_id,
      moderator_id: initiator.user.id,
      warn_id: warnId,
      reason,
    })

    if (removeTimeout) {
      await guildMember.timeout(null).catch(() => {
        return notify(interaction, {
          type: 'info',
          message:
            'Варн снят, однако снять таймаут с пользователя не удалось. Возможно, не хватает каких-то прав. Попробуй сделать это вручную.',
        })
      })
    }

    return notify(interaction, {
      type: 'success',
      message: `Варн **${warnId}** был успешно убран.`,
    })
  } catch (error) {
    console.error(error)

    return notify(interaction, {
      type: 'error',
      message:
        'Произошла ошибка при обработке команды. Свяжитесь с автором бота.',
    })
  }
}

const execute = withDeferredResponse(
  withPrivilegeCheck(handleClearWarn, isMod),
  {
    flags: [MessageFlags.Ephemeral],
  },
)

export default { data, execute }
