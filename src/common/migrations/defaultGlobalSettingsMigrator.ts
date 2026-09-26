import type { GlobalSettingsMigration } from '../schemas/migration'
import { isRecord } from '../utils/isRecord'
import { m } from './migrationUtils'

export const defaultGlobalSettingsMigrator: GlobalSettingsMigration = (settings, defaults) => {
  return mergeDefaults(settings as Record<string, unknown>, defaults as Record<string, unknown>)
}

const mergeDefaults = (
  settings: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> => {
  const merged = m.applyDefaults(settings, defaults)

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const storedValue = settings[key]

    if (isRecord(defaultValue) && typeof storedValue !== 'undefined') {
      if (!isRecord(storedValue)) {
        throw new Error(`Expected ${key} object`)
      }

      merged[key] = mergeDefaults(storedValue, defaultValue)
    }
  }

  return merged
}
