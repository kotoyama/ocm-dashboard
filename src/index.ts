import { Glob } from 'bun'
import path from 'node:path'
import { Client, Collection, GatewayIntentBits } from 'discord.js'

import env from '~/config'
import { loadCommands } from '~/shared/lib'

async function bootstrap() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.commands = new Collection()

  // loading commands
  const commands = await loadCommands()

  for (const [commandName, command] of commands) {
    client.commands.set(commandName, command)
  }

  // loading events
  const eventsGlob = new Glob('src/events/**/*.event.ts')

  for await (const file of eventsGlob.scan('.')) {
    const filePath = path.resolve(process.cwd(), file)
    const event = await import(filePath).then((m) => m.default)

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
  }

  client.login(env.DISCORD_TOKEN)
}

bootstrap()
