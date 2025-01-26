import {
  Message,
  GuildMember,
  TextChannel,
  MessageFlags,
  CommandInteraction,
  SlashCommandBuilder,
} from 'discord.js'

import { db } from '~/db'
import { isBotAuthor, withPrivilegeCheck } from '~/middlewares'
import { logAction, notify, withDeferredResponse } from '~/shared/lib'

const data = new SlashCommandBuilder()
  .setName('clearwarns')
  .setDescription('Обнулить все варны (Dev Only)')

async function handleClearWarns(interaction: CommandInteraction) {
  try {
    const channel = interaction.channel as TextChannel

    await interaction.editReply({
      content:
        'Ты собираешься обнулить все варны на сервере. Действительно продолжить? (y/n)',
    })

    const filter = (message: Message) =>
      interaction.user.id === message.author.id

    try {
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 60_000,
        errors: ['time'],
      })
      const response = collected.first()?.content?.toLowerCase()

      if (response === 'y') {
        const { changes } = db.query('DELETE FROM warns;').run()

        if (!changes) {
          return interaction.followUp({
            content: '❌ Варнов не найдено для обнуления.',
            flags: [MessageFlags.Ephemeral],
          })
        }

        const initiator = interaction.member as GuildMember

        await logAction(interaction.client, {
          channel: 'modlog',
          action: 'clear-warns',
          moderator_id: initiator.user.id,
        })

        return interaction.followUp({
          content: '✅ Варны были успешно обнулены.',
          flags: [MessageFlags.Ephemeral],
        })
      } else if (response === 'n') {
        return interaction.followUp({
          content: '❌ Операция отменена из-за отказа пользователя.',
          flags: [MessageFlags.Ephemeral],
        })
      } else {
        return interaction.followUp({
          content: '❌ Я тебя не понял.',
          flags: [MessageFlags.Ephemeral],
        })
      }
    } catch (error) {
      return interaction.followUp({
        content: '❌ Операция отменена по истечении времени.',
        flags: [MessageFlags.Ephemeral],
      })
    }
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
  withPrivilegeCheck(handleClearWarns, isBotAuthor),
  { flags: [MessageFlags.Ephemeral] },
)

export default { data, execute }
