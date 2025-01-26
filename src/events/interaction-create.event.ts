import { Events, type Interaction } from 'discord.js'

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      throw new Error(
        `❌ No command matching ${interaction.commandName} was found`,
      )
    }

    await command.execute(interaction)
  },
}
