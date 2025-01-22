import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('warnslist')
  .setDescription('Показать варны пользователя')
  .addUserOption((option) =>
    option.setName('user_id').setDescription('Пользователь').setRequired(true),
  )
  .addIntegerOption((option) =>
    option.setName('page').setDescription('Страница пагинации').setMinValue(1),
  )
