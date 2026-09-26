import { LanguageSchema } from '../schemas/settings'
import { EN } from '../translations/en'
import { HU } from '../translations/hu'
import { TranslationSchema } from '../translations/translationSchema'
import { useGlobalSettings } from './useGlobalSettings'

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

export const useTranslation = (): UseTranslationResult => {
  const { settings } = useGlobalSettings()
  return languages[settings.app.language]
}
