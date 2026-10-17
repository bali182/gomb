import type { LanguageSchema } from '../schemas/settings'
import { EN } from './en'
import { HU } from './hu'
import type { TranslationSchema } from './translationSchema'

export type TranslationResult = {
  language: LanguageSchema
  t: TranslationSchema
}

const languages: Record<LanguageSchema, TranslationResult> = {
  'en-GB': {
    language: 'en-GB',
    t: EN,
  },
  'hu-HU': {
    language: 'hu-HU',
    t: HU,
  },
}

export const getTranslation = (language: LanguageSchema): TranslationResult => {
  return languages[language]
}
