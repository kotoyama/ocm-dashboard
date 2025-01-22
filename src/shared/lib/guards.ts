import type { GuildMember } from 'discord.js'

import env from '~/config'

type HasRolesConfig = {
  user?: GuildMember
  roles: string[]
}

function hasRoles({ user, roles }: HasRolesConfig) {
  return user?.roles.cache.some((role) => roles.includes(role.id)) ?? false
}

export function isBotAuthor(user?: GuildMember) {
  return hasRoles({ user, roles: [env.BOT_AUTHOR_ROLE_ID] })
}

export function isMod(user?: GuildMember) {
  return hasRoles({ user, roles: env.MODERATION_ROLES_IDS })
}

export function isPlayer(user?: GuildMember) {
  return hasRoles({ user, roles: env.PLAYER_ROLES_IDS })
}
