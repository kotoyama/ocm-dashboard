import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('showwarn')
  .setDescription('Посмотреть варн')
  .addStringOption((option) =>
    option.setName('warn_id').setDescription('ID варна').setRequired(true),
  )
