import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('mywarns')
  .setDescription('Показать мои варны')
  .addIntegerOption((option) =>
    option.setName('page').setDescription('Страница пагинации').setMinValue(1),
  )
