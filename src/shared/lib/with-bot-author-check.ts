import { CommandInteraction, GuildMember, Message } from 'discord.js'

import { isBotAuthor } from './guards'
import { notify } from './notify'

export function withBotAuthorCheck(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
) {
  return async (interaction: CommandInteraction) => {
    const initiator = interaction.member as GuildMember

    if (!isBotAuthor(initiator)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь использовать эту команду.',
      })
    }

    return handler(interaction)
  }
}
