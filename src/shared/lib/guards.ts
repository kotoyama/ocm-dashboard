import type { GuildMember } from 'discord.js'

import env from '~/config'

export function isMod(user?: GuildMember) {
  return user?.roles.cache.some((role) =>
    env.MODERATION_ROLES_IDS.includes(role.id),
  )
}

export function isPlayer(user?: GuildMember) {
  return user?.roles.cache.some((role) =>
    env.PLAYER_ROLES_IDS.includes(role.id),
  )
}
