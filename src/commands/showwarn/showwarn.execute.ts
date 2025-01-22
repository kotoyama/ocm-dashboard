import { CommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js'

import { db } from '~/db'
import { notify, withDeferredResponse } from '~/shared/lib'
import type { Warn } from '~/shared/types'
import { colors, violationChoices } from '~/shared/ui'

async function handleShowWarn(interaction: CommandInteraction) {
  const warnId = interaction.options.get('warn_id', true).value as string

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

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle(guildMember?.user.username || null)
          .setDescription(warn.details)
          .setThumbnail(guildMember?.user.avatarURL() || null)
          .addFields(
            {
              name: 'ID',
              value: warn.id,
              inline: true,
            },
            {
              name: 'Причина',
              value: violationChoices[warn.reason],
              inline: true,
            },
            {
              name: 'Дата',
              value: new Date(warn.timestamp).toLocaleString(),
              inline: true,
            },
          ),
      ],
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

export const execute = withDeferredResponse(handleShowWarn, {
  flags: [MessageFlags.Ephemeral],
})
