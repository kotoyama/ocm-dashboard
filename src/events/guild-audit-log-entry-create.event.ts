import { AuditLogEvent, Events, Guild, GuildAuditLogsEntry } from 'discord.js'

import { getTimeoutDuration, logAction } from '~/shared/lib'

export default {
  name: Events.GuildAuditLogEntryCreate,
  async execute(auditLog: GuildAuditLogsEntry, guild: Guild) {
    const { action, executorId, targetId, extra, reason, ...a } = auditLog

    switch (action) {
      case AuditLogEvent.MemberUpdate:
        if (!(executorId && targetId)) {
          return
        }

        const timeoutChange = auditLog.changes.find(
          (v) => v.key === 'communication_disabled_until',
        )

        if (!timeoutChange) {
          return
        }

        if (timeoutChange.new) {
          const duration = getTimeoutDuration(
            new Date(auditLog.createdTimestamp),
            new Date(timeoutChange.new),
          )

          await logAction(guild.client, {
            channel: 'modlog',
            action: 'timeout',
            user_id: targetId,
            moderator_id: executorId,
            duration,
            reason,
          })
        } else if (timeoutChange.old && !timeoutChange.new) {
          await logAction(guild.client, {
            channel: 'modlog',
            action: 'timeout-remove',
            user_id: targetId,
            moderator_id: executorId,
          })
        }

        break
      case AuditLogEvent.MemberKick:
        if (!(executorId && targetId)) {
          return
        }

        await logAction(guild.client, {
          channel: 'modlog',
          action: 'kick',
          user_id: targetId,
          moderator_id: executorId,
          reason,
        })

        break
      case AuditLogEvent.MemberBanAdd:
        if (!(executorId && targetId)) {
          return
        }

        await logAction(guild.client, {
          channel: 'modlog',
          action: 'ban',
          user_id: targetId,
          moderator_id: executorId,
          reason,
        })

        break
      case AuditLogEvent.MemberBanRemove:
        if (!(executorId && targetId)) {
          return
        }

        await logAction(guild.client, {
          channel: 'modlog',
          action: 'ban-remove',
          user_id: targetId,
          moderator_id: executorId,
        })

        break
      default:
        break
    }
  },
}
