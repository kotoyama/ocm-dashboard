import { Events, type Interaction } from 'discord.js'

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(
        `❌ No command matching ${interaction.commandName} was found`,
      )
      return
    }

    await command.execute(interaction)
  },
}
