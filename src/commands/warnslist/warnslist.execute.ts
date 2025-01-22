import { CommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js'

import { db } from '~/db'
import {
  isMod,
  isPlayer,
  notify,
  truncate,
  withDeferredResponse,
  withRoleCheck,
} from '~/shared/lib'
import type { Warn } from '~/shared/types'
import { colors, violationChoices } from '~/shared/ui'

async function handleWarnsList(interaction: CommandInteraction) {
  const userId = interaction.options.get('user_id', true).value as string
  const page = (interaction.options.get('page')?.value as number) || 1

  try {
    const guildMember = await interaction.guild?.members.fetch(userId)

    if (!isPlayer(guildMember)) {
      return notify(interaction, {
        type: 'error',
        message: 'У этого пользователя не может быть варнов.',
      })
    }

    const [{ count: totalWarns }] = db
      .query('SELECT COUNT(*) AS count FROM warns WHERE user_id = $user_id;')
      .all({ $user_id: userId }) as [{ count: number }]

    if (!totalWarns) {
      return notify(interaction, {
        type: 'info',
        message: `У пользователя ${guildMember?.user.username} нет варнов.`,
      })
    }

    const ITEMS_PER_PAGE = 10
    const totalPages = Math.ceil(totalWarns / ITEMS_PER_PAGE)

    if (page > totalPages) {
      return notify(interaction, {
        type: 'error',
        message: `Неверная страница. Выбери страницу от 1 до ${totalPages}.`,
      })
    }

    const warns = db
      .query(
        'SELECT * FROM warns WHERE user_id = $user_id ORDER BY timestamp DESC LIMIT $limit OFFSET $offset;',
      )
      .all({
        $user_id: userId,
        $limit: ITEMS_PER_PAGE,
        $offset: (page - 1) * ITEMS_PER_PAGE,
      })

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.info)
          .setTitle(`Список варнов пользователя ${guildMember?.user.username}`)
          .setDescription(
            [
              '```',
              '| ID         | Причина        | Дата                  |',
              '| ---------- | -------------- | --------------------- |',
              ...warns.map((row) => {
                const warn = row as Warn
                return `| ${warn.id} | ${truncate(violationChoices[warn.reason], 14)} | ${new Date(warn.timestamp).toLocaleString()} |`
              }),
              '```',
            ].join('\n'),
          )
          .setFooter({ text: `Страница ${page} из ${totalPages}` }),
      ],
    })
  } catch (error) {
    console.error(error)

    return notify(interaction, {
      type: 'error',
      message:
        'Произошла ошибка при обработке команды. Свяжитесь с автором бота.',
    })
  }
}

export const execute = withDeferredResponse(
  withRoleCheck(handleWarnsList, isMod),
  { flags: [MessageFlags.Ephemeral] },
)
