import { VERSION } from '../../version'
import type { DeepPartial, GlobalSettingsMigration } from '../schemas/migration'
import type { GlobalSettingsSchema } from '../schemas/settings'
import { defaultGlobalSettingsMigrator } from './defaultGlobalSettingsMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: GlobalSettingsMigration[] = []

export const migrateGlobalSettings = (
  input: unknown,
  defaults: GlobalSettingsSchema,
): DeepPartial<GlobalSettingsSchema> => {
  const migratedSettings: DeepPartial<GlobalSettingsSchema> = migrateVersionedObject<GlobalSettingsSchema>(
    input,
    (settings) =>
      MIGRATIONS.reduce((current, migrate): DeepPartial<GlobalSettingsSchema> => migrate(current, defaults), settings),
  )

  return {
    ...defaultGlobalSettingsMigrator(migratedSettings, defaults),
    version: VERSION,
  }
}
