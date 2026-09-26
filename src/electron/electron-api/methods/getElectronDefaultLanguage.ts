import { app } from 'electron'

import type { LanguageSchema } from '../../../common/schemas/settings'

export const getElectronDefaultLanguage = (): LanguageSchema => {
  try {
    const preferredLanguage = app.getPreferredSystemLanguages()[0]

    if (preferredLanguage === undefined) {
      return 'en-GB'
    }

    return new Intl.Locale(preferredLanguage).language === 'hu' ? 'hu-HU' : 'en-GB'
  } catch (e) {
    console.error('Failed to retrieve system language', e)
    return 'en-GB'
  }
}
