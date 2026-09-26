import typia from 'typia'
import { describe, expect, it } from 'vitest'

import { VERSION } from '../../version'
import type { DeepPartial } from '../schemas/migration'
import type { GlobalSettingsSchema } from '../schemas/settings'
import { createDefaultGlobalSettings } from '../utils/createDefaultGlobalSettings'
import { migrateGlobalSettings } from './migrateGlobalSettings'

const defaults = createDefaultGlobalSettings('light')

describe('migrateGlobalSettings', () => {
  it('adds nested defaults to versionless settings while preserving existing values and arrays', () => {
    const splitterSizes: [string, string] = ['250px', '450px']
    const legacySettings: DeepPartial<GlobalSettingsSchema> = {
      app: { splitterSizes, theme: 'dark' },
      edit: { step: 5 },
    }

    const migratedSettings = migrateGlobalSettings(legacySettings, defaults)

    expect(migratedSettings).toEqual({
      ...defaults,
      app: { ...defaults.app, splitterSizes, theme: 'dark' },
      edit: { ...defaults.edit, step: 5 },
    })
    expect(migratedSettings.app?.splitterSizes).toBe(splitterSizes)
    expect(typia.is<GlobalSettingsSchema>(migratedSettings)).toBe(true)
  })

  it('creates settings from an empty object', () => {
    expect(migrateGlobalSettings({}, defaults)).toEqual(defaults)
  })

  it('does not repair an existing incomplete array', () => {
    const splitterSizes = ['250px']
    const migratedSettings = migrateGlobalSettings({ app: { splitterSizes } }, defaults)

    expect(migratedSettings.app?.splitterSizes).toBe(splitterSizes)
    expect(typia.is<GlobalSettingsSchema>(migratedSettings)).toBe(false)
  })

  it('migrates an older settings version', () => {
    const legacySettings: DeepPartial<GlobalSettingsSchema> = {
      ...defaults,
      version: '0.0.0',
    }

    expect(migrateGlobalSettings(legacySettings, defaults).version).toBe(VERSION)
  })

  it('returns settings with the current version unchanged', () => {
    expect(migrateGlobalSettings(defaults, defaults)).toBe(defaults)
  })

  it('migrates settings with a different version', () => {
    const [major] = VERSION.split('.')
    const newerSettings = { ...defaults, version: `${Number(major) + 1}.0.0` }

    expect(migrateGlobalSettings(newerSettings, defaults).version).toBe(VERSION)
  })

  it('rejects a non-object settings root', () => {
    expect(() => migrateGlobalSettings(null, defaults)).toThrow()
    expect(() => migrateGlobalSettings([], defaults)).toThrow()
  })

  it('rejects an invalid nested object', () => {
    expect(() => migrateGlobalSettings({ app: 5 }, defaults)).toThrow()
  })

  it('returns the same result when legacy settings are migrated repeatedly', () => {
    const legacySettings = { app: { theme: 'dark' } }
    const migratedSettings = migrateGlobalSettings(legacySettings, defaults)

    expect(migrateGlobalSettings(migratedSettings, defaults)).toEqual(migratedSettings)
  })
})
