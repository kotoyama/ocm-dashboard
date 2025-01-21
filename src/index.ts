import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  PresenceUpdateStatus,
} from 'discord.js'

import env from '~/config'
import { commands } from '~/commands'
import { Violation } from '~/shared/types'
import { deployCommands } from './deploy-commands'
import { db } from './db'

async function bootstrap() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  })

  client.once(Events.ClientReady, () => {
    /** @see https://bun.sh/docs/api/sqlite#wal-mode */
    db.exec('PRAGMA journal_mode = WAL;')
    db.exec(`
      CREATE TABLE IF NOT EXISTS warns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        reason TEXT NOT NULL CHECK (
          reason IN (${Object.values(Violation)
            .map((value) => `'${value}'`)
            .join(', ')})
        ),
        details TEXT CHECK (LENGTH(details) <= 280),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

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
