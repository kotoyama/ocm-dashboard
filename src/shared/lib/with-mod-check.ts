import {
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
} from 'discord.js'

import env from '~/config'
import { colors } from '../ui'

export function withModCheck(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
) {
  return async (interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember

    if (
      !member.roles.cache.some((role) =>
        env.MODERATION_ROLES_IDS.includes(role.id),
      )
    ) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.error)
            .setDescription('❌ You are not allowed to use this bot.'),
        ],
      })
    }

    return handler(interaction)
  }
}
