import type { PocketItemIdSchema, PocketItemSchema } from '../schemas/pocketItem'
import { banknotes } from './banknotes'
import { cards } from './cards'

export const pocketItems: Record<PocketItemIdSchema, PocketItemSchema> = Object.fromEntries(
  [...cards, ...banknotes].map((item) => [item.id, item]),
) as Record<PocketItemIdSchema, PocketItemSchema>
