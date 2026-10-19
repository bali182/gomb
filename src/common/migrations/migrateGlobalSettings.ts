import { VERSION } from '../../version'
import type { GlobalSettingsMigration } from '../schemas/migration'
import type { GlobalSettingsSchema } from '../schemas/settings'
import type { DeepPartialSchema } from '../schemas/utils'
import { defaultGlobalSettingsMigrator } from './defaultGlobalSettingsMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: GlobalSettingsMigration[] = []

export const migrateGlobalSettings = (
  input: unknown,
  defaults: GlobalSettingsSchema,
): DeepPartialSchema<GlobalSettingsSchema> => {
  const migratedSettings: DeepPartialSchema<GlobalSettingsSchema> = migrateVersionedObject<GlobalSettingsSchema>(
    input,
    (settings) =>
      MIGRATIONS.reduce(
        (current, migrate): DeepPartialSchema<GlobalSettingsSchema> => migrate(current, defaults),
        settings,
      ),
  )

  return {
    ...defaultGlobalSettingsMigrator(migratedSettings, defaults),
    version: VERSION,
  }
}
