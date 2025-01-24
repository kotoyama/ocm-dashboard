import {
  CommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js'

import { db } from '~/db'
import {
  isBotAuthor,
  logAction,
  notify,
  withDeferredResponse,
  withRoleCheck,
} from '~/shared/lib'

const data = new SlashCommandBuilder()
  .setName('clearwarns')
  .setDescription('Обнулить все варны (Dev Only)')

async function handleClearWarns(interaction: CommandInteraction) {
  try {
    const { changes } = db.query('DELETE FROM warns;').run()

    if (!changes) {
      return notify(interaction, {
        type: 'error',
        message: 'Варнов не найдено для обнуления.',
      })
    }

    const initiator = interaction.member as GuildMember

    await logAction(interaction.client, {
      channel: 'modlog',
      action: 'clear-warns',
      moderator_id: initiator.user.id,
    })

    return notify(interaction, {
      type: 'success',
      message: `Варны были успешно обнулены.`,
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

const execute = withDeferredResponse(
  withRoleCheck(handleClearWarns, isBotAuthor),
  { flags: [MessageFlags.Ephemeral] },
)

export default { data, execute }
