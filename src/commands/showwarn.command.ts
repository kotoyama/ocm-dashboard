import {
  CommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'

import { db } from '~/db'
import config from '~/config/variables'
import {
  notify,
  getMember,
  formatDate,
  withDeferredResponse,
} from '~/shared/lib'
import type { Warn } from '~/shared/types'

const data = new SlashCommandBuilder()
  .setName('showwarn')
  .setDescription('Посмотреть варн')
  .addStringOption((option) =>
    option.setName('warn_id').setDescription('ID варна').setRequired(true),
  )

async function handleShowWarn(interaction: CommandInteraction) {
  try {
    const warnId = interaction.options.get('warn_id', true).value as string

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
    const guildMember = await getMember(interaction, warn.user_id)

    if (!guildMember) {
      return notify(interaction, {
        type: 'error',
        message: 'Пользователь не найден.',
      })
    }

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.info)
          .setTitle(guildMember.user.username || null)
          .setDescription(warn.details)
          .setThumbnail(guildMember.user.avatarURL() || null)
          .addFields(
            {
              name: 'ID',
              value: warn.id,
              inline: true,
            },
            {
              name: 'Причина',
              value: config.violations[warn.reason],
              inline: true,
            },
            {
              name: 'Дата',
              value: formatDate(warn.timestamp),
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

const execute = withDeferredResponse(handleShowWarn, {
  flags: [MessageFlags.Ephemeral],
})

export default { data, execute }
