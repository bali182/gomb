import { useMemo } from 'react'

import {
  africanBanknotes,
  asianBanknotes,
  europeanBanknotes,
  northAmericanBanknotes,
  oceanianBanknotes,
  southAmericanBanknotes,
} from '../data/banknotes'
import { cards } from '../data/cards'
import type { CurrencyIdSchema } from '../schemas/currency'
import type {
  BankNotePocketItemSchema,
  TranslatedPocketItemGroupIdSchema,
  TranslatedPocketItemGroupSchema,
  TranslatedPocketItemSchema,
} from '../schemas/pocketItem'
import { TranslationResult } from '../translations/getTranslation'
import { isDefined } from '../utils/isDefined'
import { useTranslation } from './useTranslation'

export type UsePocketItemsResultSchema = {
  groups: TranslatedPocketItemGroupSchema[]
  filteredGroups: TranslatedPocketItemGroupSchema[]
}

export const usePocketItems = (filter: (item: TranslatedPocketItemSchema) => boolean): UsePocketItemsResultSchema => {
  const translation = useTranslation()

  const groups = useMemo<TranslatedPocketItemGroupSchema[]>(() => {
    const cardsGroup: TranslatedPocketItemGroupSchema = {
      id: 'cards',
      name: translation.t.data.pocketItemGroups.cards,
      items: cards.map((item) => ({ ...item, name: translation.t.data.cards[item.id] })),
    }

    const banknoteGroups = [
      createBanknoteGroup('african-banknotes', africanBanknotes, translation),
      createBanknoteGroup('asian-banknotes', asianBanknotes, translation),
      createBanknoteGroup('european-banknotes', europeanBanknotes, translation),
      createBanknoteGroup('north-american-banknotes', northAmericanBanknotes, translation),
      createBanknoteGroup('oceanian-banknotes', oceanianBanknotes, translation),
      createBanknoteGroup('south-american-banknotes', southAmericanBanknotes, translation),
    ].sort((first, second) => first.name.localeCompare(second.name, translation.language))
    return [cardsGroup, ...banknoteGroups]
  }, [translation])

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

const createBanknoteGroup = (
  id: Exclude<TranslatedPocketItemGroupIdSchema, 'cards'>,
  items: Partial<Record<CurrencyIdSchema, BankNotePocketItemSchema>>,
  { t, language }: TranslationResult,
): TranslatedPocketItemGroupSchema => ({
  id,
  name: t.data.pocketItemGroups[id],
  items: Object.values(items)
    .filter(isDefined)
    .map((item) => ({ ...item, name: t.data.currencies[item.id] }))
    .sort((first, second) => first.name.localeCompare(second.name, language)),
})
