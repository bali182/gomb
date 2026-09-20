import { EN2 } from '../translations/en2'
import { TranslationSchema2 } from '../translations/translationSchema'

export type TranslationLanguage2 = 'en' | 'hu'

export type UseTranslationResult2 = {
  language: TranslationLanguage2
  t: TranslationSchema2
}

const languages: Record<TranslationLanguage2, UseTranslationResult2> = {
  en: {
    language: 'en',
    t: EN2,
  },
  hu: {
    language: 'en',
    t: EN2,
  },
}

const getTranslationLanguage = (): TranslationLanguage2 => {
  const language = new Intl.Locale(navigator.language).language

  switch (language) {
    case 'hu':
      return 'hu'
    default:
      return 'en'
  }
}

export const useTranslation2 = (): UseTranslationResult2 => {
  return languages[getTranslationLanguage()]
}
