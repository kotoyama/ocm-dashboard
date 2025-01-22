import { CommandInteraction, MessageFlags } from 'discord.js'

import { db } from '~/db'
import {
  isBotAuthor,
  notify,
  withDeferredResponse,
  withRoleCheck,
} from '~/shared/lib'

async function handleClearWarns(interaction: CommandInteraction) {
  try {
    const { changes } = db.query('DELETE FROM warns;').run()

    if (!changes) {
      return notify(interaction, {
        type: 'error',
        message: 'Варнов не найдено для обнуления.',
      })
    }

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

export const execute = withDeferredResponse(
  withRoleCheck(handleClearWarns, isBotAuthor),
  { flags: [MessageFlags.Ephemeral] },
)
