import { CommandInteraction, Message } from 'discord.js'

/** @see https://discordjs.guide/slash-commands/response-methods.html#deferred-responses */
export function withDeferredResponse(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
) {
  return async (interaction: CommandInteraction) => {
    await interaction.deferReply()
    await wait(4000)
    return handler(interaction)
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
