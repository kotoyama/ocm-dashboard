import {
  CommandInteraction,
  MessageFlags,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js'

import { db } from '~/db'
import config from '~/config/variables'
import { isAdmin, isPlayer } from '~/middlewares'
import {
  formatDate,
  notify,
  truncate,
  withDeferredResponse,
} from '~/shared/lib'
import type { Warn } from '~/shared/types'

const data = new SlashCommandBuilder()
  .setName('mywarns')
  .setDescription('Показать мои варны')
  .addIntegerOption((option) =>
    option.setName('page').setDescription('Страница').setMinValue(1),
  )

async function handleMyWarns(interaction: CommandInteraction) {
  const page = (interaction.options.get('page')?.value as number) || 1

  try {
    const initiator = interaction.member as GuildMember
    const guildMember = await interaction.guild?.members.fetch(
      initiator.user.id,
    )

    if (!guildMember) {
      return notify(interaction, {
        type: 'error',
        message: 'Пользователь не найден.',
      })
    }

    if (isAdmin(guildMember) || !isPlayer(guildMember)) {
      return notify(interaction, {
        type: 'error',
        message: 'У тебя не может быть варнов.',
      })
    }

    const [{ count: totalWarns }] = db
      .query('SELECT COUNT(*) AS count FROM warns WHERE user_id = $user_id;')
      .all({ $user_id: initiator.user.id }) as [{ count: number }]

    if (!totalWarns) {
      return notify(interaction, {
        type: 'info',
        message: 'У тебя нет варнов.',
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
        $user_id: initiator.user.id,
        $limit: ITEMS_PER_PAGE,
        $offset: (page - 1) * ITEMS_PER_PAGE,
      })

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.info)
          .setTitle('Список твоих варнов')
          .setDescription(
            [
              '```',
              '| ID         | Причина        | Дата              |',
              '| ---------- | -------------- | ----------------- |',
              ...warns.map((row) => {
                const warn = row as Warn
                return `| ${warn.id} | ${truncate(config.violations[warn.reason], 14)} | ${formatDate(warn.timestamp)} |`
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

const execute = withDeferredResponse(handleMyWarns, {
  flags: [MessageFlags.Ephemeral],
})

export default { data, execute }
