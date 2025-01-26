import {
  Attachment,
  channelLink,
  Collection,
  EmbedBuilder,
  TextChannel,
  type APIEmbedField,
  type Client,
  type RestOrArray,
} from 'discord.js'

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
  | {
      channel: 'modlog'
      action: 'timeout'
      user_id: string
      moderator_id: string
      reason: string | null
      duration: string
    }
  | {
      channel: 'modlog'
      action: 'timeout-remove'
      user_id: string
      moderator_id: string
    }
  | {
      channel: 'modlog'
      action: 'kick'
      user_id: string
      moderator_id: string
      reason: string | null
    }
  | {
      channel: 'modlog'
      action: 'ban'
      user_id: string
      moderator_id: string
      reason: string | null
    }
  | {
      channel: 'modlog'
      action: 'ban-remove'
      user_id: string
      moderator_id: string
    }
  | {
      channel: 'msglog'
      action: 'message-update'
      channelId: string
      author_id: string
      beforeContent: string
      afterContent: string
    }
  | {
      channel: 'msglog'
      action: 'message-remove'
      channelId: string
      author_id: string
      content: string
      attachments: Collection<string, Attachment>
    }

export async function logAction(client: Client, logEntry: LogEntry) {
  const channels = {
    modlog: env.MODLOG_CHANNEL_ID,
    msglog: env.MESSAGELOG_CHANNEL_ID,
  }

  const logChannel = client.channels.cache.get(channels[logEntry.channel]) as
    | TextChannel
    | undefined

  if (!logChannel) {
    throw new Error('❌ Channel not found')
  }

  const embed = new EmbedBuilder().setColor(config.colors.info).setTimestamp()

  let description = ''
  const fields: RestOrArray<APIEmbedField> = []

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
    case 'timeout':
      const timeoutReason = logEntry.reason
        ? ` по причине: **${logEntry.reason}**`
        : ''
      description = `<@${logEntry.user_id}> получил таймаут на ${logEntry.duration} от <@${logEntry.moderator_id}>${timeoutReason}`
      break
    case 'timeout-remove':
      description = `<@${logEntry.moderator_id}> снял таймаут с <@${logEntry.user_id}>`
      break
    case 'kick':
      const kickReason = logEntry.reason
        ? ` по причине: **${logEntry.reason}**`
        : ''
      description = `<@${logEntry.user_id}> был кикнут <@${logEntry.moderator_id}>${kickReason}`
      break
    case 'ban':
      const banReason = logEntry.reason
        ? ` по причине: **${logEntry.reason}**`
        : ''
      description = `<@${logEntry.user_id}> был забанен <@${logEntry.moderator_id}>${banReason}`
      break
    case 'ban-remove':
      description = `<@${logEntry.moderator_id}> снял бан с <@${logEntry.user_id}>`
      break
    case 'message-update':
      description = `Сообщение <@${logEntry.author_id}> было отредактировано в ${channelLink(logEntry.channelId)}`

      fields.push(
        {
          name: 'Контент до',
          value: logEntry.beforeContent,
          inline: false,
        },
        {
          name: 'Контент после',
          value: logEntry.afterContent,
          inline: false,
        },
      )

      break
    case 'message-remove':
      description = `Сообщение <@${logEntry.author_id}> было удалено в ${channelLink(logEntry.channelId)}`

      if (logEntry.content) {
        fields.push({
          name: 'Контент',
          value: logEntry.content,
          inline: false,
        })
      }

      if (logEntry.attachments.size > 0) {
        logEntry.attachments.map((attachment) => embed.setImage(attachment.url))
      }

      break
    default:
      break
  }

  if (description) {
    embed.setDescription(description)
  }

  if (fields.length > 0) {
    embed.setFields(fields)
  }

  return logChannel.send({ embeds: [embed] })
}
