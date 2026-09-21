import typia from 'typia'

import { migrateProject } from '../migrations/migrateProject'
import type { ProjectSchema } from '../schemas/project'
import type { GlobalSettingsSchema } from '../schemas/settings'

type StorageKey = 'global-settings' | 'projects'

export const readGlobalSettingsFromStorage = (defaultValue: GlobalSettingsSchema): GlobalSettingsSchema => {
  return safeReadStorage<GlobalSettingsSchema>('global-settings', defaultValue, (raw) =>
    typia.assert<GlobalSettingsSchema>(raw),
  )
}

export const saveGlobalSettingsToStorage = (settings: GlobalSettingsSchema): void => {
  safeWriteStorage('global-settings', settings)
}

export const readProjectsFromStorage = (): ProjectSchema[] => {
  return safeReadStorage<ProjectSchema[]>('projects', [], (raw) => {
    if (!Array.isArray(raw)) {
      throw new Error('Expected projects array')
    }
    return typia.assert<ProjectSchema[]>(raw.map(migrateProject))
  })
}

export const saveProjectsToStorage = (projects: ProjectSchema[]): void => {
  safeWriteStorage('projects', projects)
}

const safeReadStorage = <T>(key: StorageKey, defaultValue: T, parse: (raw: unknown) => T): T => {
  try {
    const storedValue = localStorage.getItem(key)

    if (storedValue === null) {
      return defaultValue
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    return parse(parsedValue)
  } catch (error) {
    try {
      localStorage.removeItem(key)
    } catch (removeError) {
      console.error(`Unable to remove invalid stored ${key}:`, removeError)
    }

    console.error(`Unable to read stored ${key}:`, error)
    return defaultValue
  }
}

const safeWriteStorage = <T>(key: StorageKey, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key}:`, error)
  }
}
