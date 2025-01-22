import { SlashCommandBuilder } from 'discord.js'

import { violationChoices } from '~/shared/ui'

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Выдать варн пользователю')
  .addUserOption((option) =>
    option.setName('user_id').setDescription('Пользователь').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('violation')
      .setDescription('Причина варна')
      .setRequired(true)
      .addChoices(
        Object.entries(violationChoices).map(([value, name]) => ({
          name,
          value,
        })),
      ),
  )
  .addStringOption((option) =>
    option
      .setName('details')
      .setDescription('Дополнительная информация')
      .setMaxLength(280),
  )
