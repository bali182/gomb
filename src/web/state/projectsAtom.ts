import { atom } from 'jotai'
import type { SetStateAction } from 'react'

import type { ProjectMigrationContextSchema } from '../../common/schemas/migration'
import type { ProjectSchema } from '../../common/schemas/project'
import { getTranslation } from '../../common/translations/getTranslation'
import { initialGlobalSettings } from './globalSettingsAtom'
import { readProjectsFromStorage, saveProjectsToStorage } from './storage'

const migrationContext: ProjectMigrationContextSchema = {
  t: getTranslation(initialGlobalSettings.app.language).t,
}

const projectsStorageAtom = atom<ProjectSchema[]>(readProjectsFromStorage(migrationContext))

export const projectsAtom = atom(
  (get): ProjectSchema[] => get(projectsStorageAtom),
  (get, set, update: SetStateAction<ProjectSchema[]>): void => {
    const currentProjects = get(projectsStorageAtom)
    const updatedProjects = typeof update === 'function' ? update(currentProjects) : update

    set(projectsStorageAtom, updatedProjects)
    saveProjectsToStorage(updatedProjects)
  },
)
