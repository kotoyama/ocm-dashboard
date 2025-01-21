import { z } from 'zod'

/**
 * This file is used to validate and return environment variables
 * We use zod to validate them
 *
 * For more information on the zod api
 * @link https://zod.dev/
 */
const variables = {
  DISCORD_TOKEN: z.string().nonempty(),
  DISCORD_CLIENT_ID: z.string().nonempty(),
  AUTOLOG_CHANNEL_ID: z.string().nonempty(),
  PLAYER_ROLES_IDS: z
    .string()
    .nonempty()
    .transform((value) => value.split(','))
    .pipe(z.string().trim().array()),
  MODERATION_ROLES_IDS: z
    .string()
    .nonempty()
    .transform((value) => value.split(','))
    .pipe(z.string().trim().array()),
}

const schema = z.object(variables)
const result = schema.safeParse(Bun.env)

if (result.error) {
  console.error(
    '❌ Invalid environment variables: ',
    JSON.stringify(result.error.format(), null, 4),
  )
  process.exit(1)
}

export default result.data
