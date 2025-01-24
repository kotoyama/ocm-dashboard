import { Database } from 'bun:sqlite'

import env from '~/config'

export const db = new Database(`./${env.NODE_ENV}.sqlite`, { create: true })
