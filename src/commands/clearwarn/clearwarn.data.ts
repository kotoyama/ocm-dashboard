import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('clearwarn')
  .setDescription('Убрать варн')
  .addStringOption((option) =>
    option.setName('warn_id').setDescription('ID варна').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('Причина')
      .setMaxLength(280)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName('remove_timeout')
      .setDescription(
        'Надо ли снять с пользователя текущий таймаут, если имеется',
      ),
  )
