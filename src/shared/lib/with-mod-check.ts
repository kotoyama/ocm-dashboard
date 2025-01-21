import { CommandInteraction, GuildMember, Message } from 'discord.js'

import { isMod } from './guards'
import { notify } from './notify'

export function withModCheck(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
) {
  return async (interaction: CommandInteraction) => {
    const initiator = interaction.member as GuildMember

    if (!isMod(initiator)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь использовать эту команду.',
      })
    }

    return handler(interaction)
  }
}
