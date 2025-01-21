import { EmbedBuilder, type CommandInteraction } from 'discord.js'

import { colors } from '../ui'

type NotifyConfig = { type: keyof typeof colors; message: string }

export function notify(interaction: CommandInteraction, config: NotifyConfig) {
  return interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(colors[config.type])
        .setDescription(config.message),
    ],
  })
}
