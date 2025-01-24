import { Glob } from 'bun'
import path from 'node:path'
import type { CommandInteraction, Message } from 'discord.js'

type Command = {
  data: {
    name: string
    description: string
  }
  execute: (interaction: CommandInteraction) => Promise<void | Message<boolean>>
}

export async function loadCommands() {
  const commands = new Map<string, Command>()
  const commandsGlob = new Glob('src/commands/**/*.command.ts')

  for await (const file of commandsGlob.scan('.')) {
    const filePath = path.resolve(process.cwd(), file)
    const command = await import(filePath).then((m) => m.default)

    if ('data' in command && 'execute' in command) {
      commands.set(command.data.name, command)
    } else {
      console.warn(
        `⚠️ The command ${file} is missing a required "data" or "execute" property`,
      )
    }
  }

  return commands
}
