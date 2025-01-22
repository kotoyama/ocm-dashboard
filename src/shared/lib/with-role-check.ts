import { CommandInteraction, GuildMember, Message } from 'discord.js'

import { notify } from './notify'

export function withRoleCheck(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
  checkRoleFn: (user?: GuildMember) => boolean,
) {
  return (interaction: CommandInteraction) => {
    const initiator = interaction.member as GuildMember

    if (!checkRoleFn(initiator)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь использовать эту команду.',
      })
    }

    return handler(interaction)
  }
}
