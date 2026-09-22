import { atom } from 'jotai'
import type { SetStateAction } from 'react'

import type { ProjectSchema } from '../../common/schemas/project'
import { readProjectsFromStorage, saveProjectsToStorage } from './storage'

const projectsStorageAtom = atom<ProjectSchema[]>(readProjectsFromStorage())

export const projectsAtom = atom(
  (get): ProjectSchema[] => get(projectsStorageAtom),
  (get, set, update: SetStateAction<ProjectSchema[]>): void => {
    const currentProjects = get(projectsStorageAtom)
    const updatedProjects = typeof update === 'function' ? update(currentProjects) : update

    set(projectsStorageAtom, updatedProjects)
    saveProjectsToStorage(updatedProjects)
  },
)
