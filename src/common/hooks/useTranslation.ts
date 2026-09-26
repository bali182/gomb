import { LanguageSchema } from '../schemas/settings'
import { EN } from '../translations/en'
import { HU } from '../translations/hu'
import { TranslationSchema } from '../translations/translationSchema'

export type UseTranslationResult = {
  language: LanguageSchema
  t: TranslationSchema
}

const languages: Record<LanguageSchema, UseTranslationResult> = {
  'en-GB': {
    language: 'en-GB',
    t: EN,
  },
  'hu-HU': {
    language: 'hu-HU',
    t: HU,
  },
}

const getTranslationLanguage = (): LanguageSchema => {
  const language = new Intl.Locale(navigator.language).language

  switch (language) {
    case 'hu':
      return 'hu-HU'
    default:
      return 'en-GB'
  }
}

export const useTranslation = (): UseTranslationResult => {
  return languages[getTranslationLanguage()]
}
