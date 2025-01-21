import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  PresenceUpdateStatus,
} from 'discord.js'

import env from '~/config'
import { commands } from '~/commands'
import { deployCommands } from './deploy-commands'

async function bootstrap() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  })

  client.once(Events.ClientReady, () => {
    console.log('Discord bot is ready! 🐐')

    client.user?.setPresence({
      activities: [{ name: 'everyone', type: ActivityType.Watching }],
      status: PresenceUpdateStatus.Online,
    })
  })

  client.on(Events.GuildCreate, async (guild) => {
    await deployCommands({ guildId: guild.id })
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return
    }

    const { commandName } = interaction
    const command = commands[commandName as keyof typeof commands]

    if (command) {
      command.execute(interaction)
    }
  })

  client.login(env.DISCORD_TOKEN)
}

bootstrap()
