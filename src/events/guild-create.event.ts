import { Events, Guild } from 'discord.js'

import env from '~/config'

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    if (guild.id !== env.ALLOWED_SERVER_ID) {
      console.error('❌ Guild is not allowed')
    }
  },
}
