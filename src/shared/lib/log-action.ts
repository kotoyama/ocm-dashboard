import { EmbedBuilder, TextChannel, type Client } from 'discord.js'

import env from '~/config'
import config from '~/config/variables'
import type { Violation } from '../types'

type LogEntry =
  | {
      channel: 'modlog'
      action: 'warn'
      warn_id: string
      user_id: string
      moderator_id: string
      violation: Violation
    }
  | {
      channel: 'modlog'
      action: 'clear-warn'
      warn_id: string
      user_id: string
      moderator_id: string
      reason: string
    }
  | {
      channel: 'modlog'
      action: 'clear-warns'
      moderator_id: string
    }
  | { channel: 'modlog'; action: 'timeout' }
  | { channel: 'modlog'; action: 'timeout-ended' }
  | { channel: 'modlog'; action: 'kick' }
  | { channel: 'modlog'; action: 'ban' }

export async function logAction(client: Client, logEntry: LogEntry) {
  const channels = {
    modlog: env.MODLOG_CHANNEL_ID,
    msglog: env.MESSAGELOG_CHANNEL_ID,
  }

  const logChannel = client.channels.cache.get(channels[logEntry.channel]) as
    | TextChannel
    | undefined

  if (!logChannel) {
    console.error('❌ Channel not found')
    return
  }

  const embed = new EmbedBuilder().setColor(config.colors.info).setTimestamp()

  let description = ''

  switch (logEntry.action) {
    case 'warn':
      description = `<@${logEntry.user_id}> получил варн **${logEntry.warn_id}** от <@${logEntry.moderator_id}> за нарушение правила **"${config.violations[logEntry.violation]}"**`
      break

    case 'clear-warn':
      description = `<@${logEntry.moderator_id}> снял варн **${logEntry.warn_id}** с <@${logEntry.user_id}> по причине: **"${logEntry.reason}"**`
      break
    case 'clear-warns':
      description = `<@${logEntry.moderator_id}> обнулил все варны на сервере`
      break
    default:
      break
  }

  if (description) {
    embed.setDescription(description)
  }

  return logChannel.send({ embeds: [embed] })
}
