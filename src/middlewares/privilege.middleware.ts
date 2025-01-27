import type { CommandInteraction, GuildMember, Message } from 'discord.js'

import env from '~/config'
import { notify } from '~/shared/lib'

export function withPrivilegeCheck(
  handler: (
    interaction: CommandInteraction,
  ) => Promise<void | Message<boolean>>,
  checkPrivilegeFn: (user?: GuildMember) => boolean,
) {
  return (interaction: CommandInteraction) => {
    const initiator = interaction.member as GuildMember

    if (!checkPrivilegeFn(initiator)) {
      return notify(interaction, {
        type: 'error',
        message: 'Ты не можешь использовать эту команду.',
      })
    }

    return handler(interaction)
  }
}

type HasRolesConfig = {
  user?: GuildMember
  roles: string[]
}

function hasRoles({ user, roles }: HasRolesConfig) {
  return user?.roles.cache.some((role) => roles.includes(role.id)) ?? false
}

export function isBotAuthor(user?: GuildMember) {
  return user?.id === env.BOT_AUTHOR_ID
}

export function isAdmin(user?: GuildMember) {
  return hasRoles({ user, roles: [env.ADMIN_ROLE_ID] })
}

export function isMod(user?: GuildMember) {
  return hasRoles({ user, roles: env.MODERATION_ROLES_IDS })
}

export function isPlayer(user?: GuildMember) {
  return hasRoles({ user, roles: env.PLAYER_ROLES_IDS })
}
