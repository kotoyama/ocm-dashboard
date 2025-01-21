import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import { withDeferredResponse, withModCheck } from '~/shared/lib'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong')

async function handlePing(interaction: CommandInteraction) {
  return interaction.editReply('Сосал?')
}

export const execute = withDeferredResponse(withModCheck(handlePing))
