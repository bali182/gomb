import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, type FC, type PropsWithChildren, type SetStateAction } from 'react'
import { useNavigate, useParams } from 'react-router'
import { accessors } from '../../common/utils/accessors'

import { getPatchedProject } from '../../common/component-patches/getPatchedProject'
import { getPatchedSubProject } from '../../common/component-patches/getPatchedSubProject'
import { needsFullProjectPatch } from '../../common/component-patches/needsFullProjectPatch'
import { EditorContext, type EditorContextType } from '../../common/contexts/EditorContext'
import { useClearSubProjectHistory } from '../../common/hooks/useClearSubProjectHistory'
import { Loadable } from '../../common/loadable'
import { getComputedSubProject } from '../../common/logic/getComputedSubProject'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { ProjectSchema } from '../../common/schemas/project'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../common/schemas/subProject'
import { isDefined } from '../../common/utils/isDefined'
import { electronAppRoutes } from '../electronAppRoutes'
import type { ElectronProjectSchema } from '../schemas/electronProject'
import type { ElectronSubProjectRouteParamsSchema } from '../schemas/electronRouteParams'
import { electronProjectAtom } from '../state/electronProjectAtom'

export const ElectronEditorContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const navigate = useNavigate()
  const [electronProject, setElectronProject] = useAtom(electronProjectAtom)
  const { clearSubProjectHistory } = useClearSubProjectHistory()
  const loadedElectronProject = Loadable.get(electronProject)
  const project = loadedElectronProject?.project

  useEffect(() => {
    clearSubProjectHistory()
  }, [clearSubProjectHistory, project?.id])

  const subProject = useMemo<SubProjectSchema | undefined>(() => {
    if (!isDefined(project) || !isDefined(subProjectId)) {
      return undefined
    }

    return accessors.project(project).optional.subProject(subProjectId)
  }, [project, subProjectId])

  const computedSubProject = useMemo<ComputedSubProjectSchema | undefined>(() => {
    if (!isDefined(project) || !isDefined(subProject)) {
      return undefined
    }

    return getComputedSubProject(subProject, project.stitchingSettings)
  }, [project, subProject])

  const setProject = useCallback(
    (update: SetStateAction<ProjectSchema>): void => {
      setElectronProject(
        (currentElectronProject: LoadableSchema<ElectronProjectSchema>): LoadableSchema<ElectronProjectSchema> =>
          Loadable.map(currentElectronProject, (loadedProject: ElectronProjectSchema): ElectronProjectSchema => {
            const updatedProject = typeof update === 'function' ? update(loadedProject.project) : update
            const projectToStore = needsFullProjectPatch(loadedProject.project, updatedProject)
              ? getPatchedProject(updatedProject)
              : updatedProject

            return {
              filePath: loadedProject.filePath,
              isDirty: true,
              project: projectToStore,
            }
          }),
      )
    },
    [setElectronProject],
  )

  const setSubProject = useCallback(
    (update: SetStateAction<SubProjectSchema>): void => {
      if (!isDefined(subProjectId)) {
        throw new Error('Cannot update the selected sub-project because no sub-project is selected.')
      }

      setProject((currentProject: ProjectSchema): ProjectSchema => {
        const subProjectIndex = currentProject.subProjects.findIndex((candidate) => candidate.id === subProjectId)

        if (subProjectIndex === -1) {
          throw new Error(
            `The sub-project selected by the route ("${subProjectId}") does not exist in the current project.`,
          )
        }

        const currentSubProject = currentProject.subProjects[subProjectIndex]
        const updatedSubProject = typeof update === 'function' ? update(currentSubProject) : update

        if (updatedSubProject.id !== subProjectId) {
          throw new Error('The selected sub-project ID cannot be changed')
        }

        const computedUpdatedSubProject = getComputedSubProject(updatedSubProject, currentProject.stitchingSettings)
        const patchedSubProject = getPatchedSubProject(updatedSubProject, computedUpdatedSubProject)
        const subProjects: SubProjectSchema[] = [
          ...currentProject.subProjects.slice(0, subProjectIndex),
          patchedSubProject,
          ...currentProject.subProjects.slice(subProjectIndex + 1),
        ]

        return {
          ...currentProject,
          subProjects,
        }
      })
    },
    [setProject, subProjectId],
  )

  const navigateToProjects = useCallback((): void => {
    navigate(electronAppRoutes.projects)
  }, [navigate])

  const navigateToProject = useCallback((): void => {
    if (!isDefined(loadedElectronProject)) {
      throw new Error('Cannot navigate to the current project because no project file is open.')
    }

    navigate(electronAppRoutes.project(loadedElectronProject.filePath))
  }, [loadedElectronProject, navigate])

  const navigateToSubProject = useCallback(
    (targetSubProjectId: string): void => {
      if (!isDefined(loadedElectronProject)) {
        throw new Error('Cannot navigate to a sub-project because no project file is open.')
      }

      navigate(electronAppRoutes.subProject(loadedElectronProject.filePath, targetSubProjectId))
    },
    [loadedElectronProject, navigate],
  )

  const value = useMemo<EditorContextType>(
    () => ({
      computedSubProject,
      navigateToProject,
      navigateToProjects,
      navigateToSubProject,
      project,
      setProject,
      setSubProject,
      subProject,
    }),
    [
      computedSubProject,
      navigateToProject,
      navigateToProjects,
      navigateToSubProject,
      project,
      setProject,
      setSubProject,
      subProject,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
