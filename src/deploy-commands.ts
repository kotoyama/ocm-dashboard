import { REST, Routes } from 'discord.js'

import env from '~/config'
import { loadCommands } from '~/shared/lib'

const rest = new REST().setToken(env.DISCORD_TOKEN)

async function deployCommands() {
  try {
    console.log('Started deleting application (/) commands...')

    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
      body: [],
    })

    console.log('Successfully deleted all application commands.')

    const commands = await loadCommands()
    const commandsData = Array.from(commands.values()).map(
      (command) => command.data,
    )

    console.log('Started refreshing application (/) commands...')

    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
      body: commandsData,
    })

    console.log('Successfully reloaded application (/) commands.')
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

deployCommands()
