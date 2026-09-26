import { nativeTheme } from 'electron'
import { readFile } from 'node:fs/promises'
import typia from 'typia'

import { migrateGlobalSettings } from '../../../common/migrations/migrateGlobalSettings'
import type { GlobalSettingsSchema } from '../../../common/schemas/settings'
import { createDefaultGlobalSettings } from '../../../common/utils/createDefaultGlobalSettings'
import { getSettingsFilePath } from './utils'

export const getSettings = async (): Promise<GlobalSettingsSchema> => {
  const defaults = createDefaultGlobalSettings(nativeTheme.shouldUseDarkColors ? 'dark' : 'light')

  try {
    const contents = await readFile(getSettingsFilePath(), 'utf8')
    const settings: unknown = JSON.parse(contents)
    const migratedSettings = migrateGlobalSettings(settings, defaults)

    if (typia.is<GlobalSettingsSchema>(migratedSettings)) {
      return migratedSettings
    }
  } catch (error) {
    console.error('Unable to read Electron settings:', error)
  }

  return defaults
}
