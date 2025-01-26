import { Events, Guild } from 'discord.js'

import env from '~/config'

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    if (guild.id !== env.ALLOWED_SERVER_ID) {
      throw new Error('❌ Guild is not allowed')
    }

    console.log(`✅ Guild ${guild.name} has been successfully registered`)
  },
}
