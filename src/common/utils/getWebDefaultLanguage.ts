import type { LanguageSchema } from '../schemas/settings'

export const getWebDefaultLanguage = (): LanguageSchema => {
  return new Intl.Locale(navigator.language).language === 'hu' ? 'hu-HU' : 'en-GB'
}
