import { EmbedBuilder, type CommandInteraction } from 'discord.js'

import config from '~/config/variables'

type NotifyParams = { type: keyof typeof config.colors; message: string }

export function notify(interaction: CommandInteraction, params: NotifyParams) {
  return interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors[params.type])
        .setDescription(params.message),
    ],
  })
}
