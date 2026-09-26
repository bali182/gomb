import { VERSION } from '../../version'
import type { DeepPartial, GlobalSettingsMigration } from '../schemas/migration'
import type { GlobalSettingsSchema } from '../schemas/settings'
import { defaultGlobalSettingsMigrator } from './defaultGlobalSettingsMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: GlobalSettingsMigration[] = [defaultGlobalSettingsMigrator]

export const migrateGlobalSettings = (
  input: unknown,
  defaults: GlobalSettingsSchema,
): DeepPartial<GlobalSettingsSchema> => {
  return migrateVersionedObject<GlobalSettingsSchema>(input, (settings) => ({
    ...MIGRATIONS.reduce((current, migrate): DeepPartial<GlobalSettingsSchema> => migrate(current, defaults), settings),
    version: VERSION,
  }))
}
