import { ActivityType, Client, Events, PresenceUpdateStatus } from 'discord.js'

import { db } from '~/db'
import { Violation } from '~/shared/types'

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log('Discord bot is ready! 🐐')

    /** @see https://bun.sh/docs/api/sqlite#wal-mode */
    db.exec('PRAGMA journal_mode = WAL;')
    db.exec(`
      CREATE TABLE IF NOT EXISTS warns (
        id TEXT PRIMARY KEY,
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

    client.user?.setPresence({
      activities: [{ name: 'everyone', type: ActivityType.Watching }],
      status: PresenceUpdateStatus.Online,
    })
  },
}
