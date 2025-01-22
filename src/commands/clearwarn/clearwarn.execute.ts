import { CommandInteraction, MessageFlags } from 'discord.js'

import { db } from '~/db'
import type { Warn } from '~/shared/types'
import {
  isMod,
  notify,
  withDeferredResponse,
  withRoleCheck,
} from '~/shared/lib'

async function handleClearWarn(interaction: CommandInteraction) {
  const warnId = interaction.options.get('warn_id', true).value as string
  const reason = interaction.options.get('reason', true).value as string
  const removeTimeout =
    (interaction.options.get('remove_timeout')?.value as boolean) || false

  try {
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
    const guildMember = await interaction.guild?.members.fetch(warn.user_id)

    const { changes } = db
      .query('DELETE FROM warns WHERE id = $warn_id;')
      .run({ $warn_id: warnId })

    if (!changes) {
      return notify(interaction, {
        type: 'error',
        message: 'Варн не найден.',
      })
    }

    if (removeTimeout) {
      guildMember?.timeout(null)
    }

    return notify(interaction, {
      type: 'success',
      message: `Варн ${warnId} был успешно убран.`,
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

export const execute = withDeferredResponse(
  withRoleCheck(handleClearWarn, isMod),
  { flags: [MessageFlags.Ephemeral] },
)
