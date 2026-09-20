import { useCallback, useMemo } from 'react'

import { useEditorContext } from '../contexts/EditorContext'
import { addSubProject as addSubProjectPure } from '../operations/project/addSubProject'
import { cloneSubProject as cloneSubProjectPure } from '../operations/project/cloneSubProject'
import { deleteSubProject as deleteSubProjectPure } from '../operations/project/deleteSubProject'
import type { ProjectSchema } from '../schemas/project'
import type { ColorSettingsSchema } from '../schemas/settings'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { id } from '../utils/id'
import { isDefined } from '../utils/isDefined'
import { useTranslation2 } from './useTranslation2'

export type UseProjectOperationsOutput = {
  cloneSubProject: (sourceSubProject: SubProjectSchema) => void
  createSubProject: () => SubProjectSchema
  deleteSubProject: (subProjectId: string) => void
  updateColorSettings: (update: Partial<ColorSettingsSchema>) => void
  updateProject: (project: ProjectSchema) => void
  updateStitchingSettings: (update: Partial<StitchLineCommonConfigSchema>) => void
}

export const useProjectOperations = (): UseProjectOperationsOutput => {
  const { project, setProject } = useEditorContext()
  const { t } = useTranslation2()

  const updateProject = useCallback(
    (updatedProject: ProjectSchema): void => {
      setProject(updatedProject)
    },
    [setProject],
  )

  const updateStitchingSettings = useCallback(
    (update: Partial<StitchLineCommonConfigSchema>): void => {
      const currentProject = ensureProject(project)

      setProject({
        ...currentProject,
        stitchingSettings: { ...currentProject.stitchingSettings, ...update },
      })
    },
    [project, setProject],
  )

  const updateColorSettings = useCallback(
    (update: Partial<ColorSettingsSchema>): void => {
      const currentProject = ensureProject(project)

      setProject({
        ...currentProject,
        colorSettings: { ...currentProject.colorSettings, ...update },
      })
    },
    [project, setProject],
  )

  const createSubProject = useCallback((): SubProjectSchema => {
    const currentProject = ensureProject(project)
    const result = addSubProjectPure(currentProject, { baseRootComponentName: t.defaultNames.rootPanel })

    setProject(result.project)

    return result.subProject
  }, [project, setProject, t.defaultNames.rootPanel])

  const cloneSubProject = useCallback(
    (sourceSubProject: SubProjectSchema): void => {
      const currentProject = ensureProject(project)

      setProject(
        cloneSubProjectPure(currentProject, {
          getUnusedId: id,
          subProject: sourceSubProject,
        }),
      )
    },
    [project, setProject],
  )

  const deleteSubProject = useCallback(
    (subProjectId: string): void => {
      const currentProject = ensureProject(project)

      setProject(deleteSubProjectPure(currentProject, { subProjectId }))
    },
    [project, setProject],
  )

  return useMemo<UseProjectOperationsOutput>(
    () => ({
      cloneSubProject,
      createSubProject,
      deleteSubProject,
      updateColorSettings,
      updateProject,
      updateStitchingSettings,
    }),
    [cloneSubProject, createSubProject, deleteSubProject, updateColorSettings, updateProject, updateStitchingSettings],
  )
}

const ensureProject = (project: ProjectSchema | undefined): ProjectSchema => {
  if (!isDefined(project)) {
    throw new Error('A valid project is required')
  }

  return project
}
