import { getTranslation, type TranslationResult } from '../translations/getTranslation'
import { useGlobalSettings } from './useGlobalSettings'

export const useTranslation = (): TranslationResult => {
  const { settings } = useGlobalSettings()
  return getTranslation(settings.app.language)
}
