import { EN } from '../translations/en'
import { TranslationSchema } from '../translations/translationSchema'

export type TranslationLanguage = 'en' | 'hu'

export type UseTranslationResult = {
  language: TranslationLanguage
  t: TranslationSchema
}

const languages: Record<TranslationLanguage, UseTranslationResult> = {
  en: {
    language: 'en',
    t: EN,
  },
  hu: {
    language: 'en',
    t: EN,
  },
}

const getTranslationLanguage = (): TranslationLanguage => {
  const language = new Intl.Locale(navigator.language).language

  switch (language) {
    case 'hu':
      return 'hu'
    default:
      return 'en'
  }
}

export const useTranslation = (): UseTranslationResult => {
  return languages[getTranslationLanguage()]
}
