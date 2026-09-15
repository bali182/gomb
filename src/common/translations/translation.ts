import { useCallback } from 'react'
import { format, register } from 'timeago.js'
import hu from 'timeago.js/lib/lang/hu'

import { EN } from './en'
import { HU } from './hu'
import type { TranslationSchema } from './translationSchema'

export type TranslationLanguage = 'en' | 'hu'

register('hu', hu)

const getTranslationLanguage = (): TranslationLanguage => {
  const language = new Intl.Locale(navigator.language).language

  switch (language) {
    case 'hu':
      return 'hu'
    default:
      return 'en'
  }
}

export const useTranslation = (): TranslationSchema => {
  switch (getTranslationLanguage()) {
    case 'hu':
      return HU
    case 'en':
      return EN
  }
}

export const useDateFormatter = (): ((date: number) => string) => {
  const locale = getTranslationLanguage() === 'hu' ? 'hu' : 'en_US'

  return useCallback((date: number): string => format(date, locale), [locale])
}
