import { sleep } from 'bun'
import {
  type InteractionDeferReplyOptions,
  CommandInteraction,
  Message,
} from 'discord.js'

/** @see https://discordjs.guide/slash-commands/response-methods.html#deferred-responses */
export function withDeferredResponse(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
  options?: InteractionDeferReplyOptions,
) {
  return async (interaction: CommandInteraction) => {
    await interaction.deferReply(options)
    await sleep(4000)
    return handler(interaction)
  }
}
