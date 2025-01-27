import type { CommandInteraction } from 'discord.js'

export function getMember(interaction: CommandInteraction, userId: string) {
  return interaction.guild?.members.fetch(userId).catch(() => null)
}
