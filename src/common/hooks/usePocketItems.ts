import { useMemo } from 'react'

import { banknotes } from '../data/banknotes'
import { cards } from '../data/cards'
import type { TranslatedPocketItemGroupSchema, TranslatedPocketItemSchema } from '../schemas/pocketItem'
import { useTranslation } from './useTranslation'

export type UsePocketItemsResultSchema = {
  groups: TranslatedPocketItemGroupSchema[]
  filteredGroups: TranslatedPocketItemGroupSchema[]
}

export const usePocketItems = (filter: (item: TranslatedPocketItemSchema) => boolean): UsePocketItemsResultSchema => {
  const { t } = useTranslation()

  const groups = useMemo<TranslatedPocketItemGroupSchema[]>(
    () => [
      {
        id: 'cards',
        name: t.data.pocketItemGroups.cards,
        items: cards.map((item) => ({ ...item, name: t.data.cards[item.id] })),
      },
      {
        id: 'banknotes',
        name: t.data.pocketItemGroups.banknotes,
        items: banknotes.map((item) => ({ ...item, name: t.data.currencies[item.id] })),
      },
    ],
    [t.data.cards, t.data.currencies, t.data.pocketItemGroups],
  )

  return useMemo<UsePocketItemsResultSchema>(
    () => ({
      groups,
      filteredGroups: groups
        .map((group) => ({ ...group, items: group.items.filter(filter) }))
        .filter((group) => group.items.length > 0),
    }),
    [filter, groups],
  )
}
