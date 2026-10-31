import { useAtom, useSetAtom, useStore } from 'jotai'
import { useCallback, useEffect, useMemo, useState, type FC, type PropsWithChildren, type SetStateAction } from 'react'
import { useNavigate, useParams } from 'react-router'

import { EditorContext, type EditorContextType } from '../../common/contexts/EditorContext'
import { useClearSubProjectHistory } from '../../common/hooks/useClearSubProjectHistory'
import { useEditorComputation } from '../../common/hooks/useEditorComputation'
import { Loadable } from '../../common/loadable'
import type { EditorComputationControlSchema } from '../../common/schemas/editorComputation'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { ProjectSchema } from '../../common/schemas/project'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../common/schemas/subProject'
import { accessors } from '../../common/utils/accessors'
import { isDefined } from '../../common/utils/isDefined'
import { electronAppRoutes } from '../electronAppRoutes'
import type { ElectronProjectSchema } from '../schemas/electronProject'
import type { ElectronSubProjectRouteParamsSchema } from '../schemas/electronRouteParams'
import { electronComputationAtom } from '../state/electronComputationAtom'
import { electronProjectAtom } from '../state/electronProjectAtom'

export const ElectronEditorContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const navigate = useNavigate()
  const store = useStore()
  const [electronProject, setElectronProject] = useAtom(electronProjectAtom)
  const setComputationControl = useSetAtom(electronComputationAtom)
  const { clearSubProjectHistory } = useClearSubProjectHistory()
  const loadedElectronProject = Loadable.get(electronProject)
  const storedProject = loadedElectronProject?.project
  const {
    state,
    retryComputation,
    setProject: computeProject,
    setSubProject: computeSubProject,
    getRequestId,
    waitUntilIdle,
  } = useEditorComputation({ project: storedProject, subProjectId })
  const [editingInputId, setEditingInputId] = useState<string | undefined>(undefined)
  const isComputing = state.result.type === 'loading' || state.result.type === 'loading-with-value'

  useEffect(() => {
    if (state.result.type === 'loaded') {
      setEditingInputId(undefined)
    }
  }, [state.result])

  useEffect(() => {
    setEditingInputId(undefined)
  }, [storedProject?.id, subProjectId])
  const result = Loadable.get(state.result)
  const project = result?.project ?? storedProject
  const computedSubProject = useMemo<LoadableSchema<ComputedSubProjectSchema>>(
    () => Loadable.map(state.result, (result) => result.computedSubProject),
    [state.result],
  )
  const subProject = useMemo<SubProjectSchema | undefined>(
    () =>
      isDefined(project) && isDefined(subProjectId)
        ? accessors.project(project).optional.subProject(subProjectId)
        : undefined,
    [project, subProjectId],
  )
  const hasSelectedSubProject = isDefined(subProject)

  useEffect(() => {
    clearSubProjectHistory()
  }, [clearSubProjectHistory, project?.id])

  useEffect(() => {
    if (state.result.type !== 'loaded') {
      return
    }
    const updatedProject = state.result.data.project
    setElectronProject(
      (current): LoadableSchema<ElectronProjectSchema> =>
        Loadable.map(current, (loaded) => {
          if (loaded.project.id !== updatedProject.id) {
            return loaded
          }
          return { ...loaded, project: updatedProject }
        }),
    )
  }, [setElectronProject, state.result])

  useEffect(() => {
    if (!hasSelectedSubProject) {
      return
    }
    const control: EditorComputationControlSchema = { getRequestId, waitUntilIdle }
    setComputationControl(control)
    return () => {
      setComputationControl((current) => (current === control ? undefined : current))
    }
  }, [getRequestId, hasSelectedSubProject, project?.id, setComputationControl, subProjectId, waitUntilIdle])

  const setProject = useCallback(
    (update: SetStateAction<ProjectSchema>): void => {
      const current = Loadable.get(store.get(electronProjectAtom))
      if (!isDefined(current)) {
        throw new Error('No project is open')
      }
      const updatedProject = typeof update === 'function' ? update(current.project) : update
      if (isDefined(subProjectId) && isDefined(accessors.project(updatedProject).optional.subProject(subProjectId))) {
        if (!current.isDirty) {
          setElectronProject((value) => Loadable.map(value, (loaded) => ({ ...loaded, isDirty: true })))
        }
        computeProject(updatedProject)
        return
      }
      setElectronProject((value) =>
        Loadable.map(value, (loaded) => ({
          ...loaded,
          isDirty: true,
          project: updatedProject,
        })),
      )
    },
    [computeProject, setElectronProject, store, subProjectId],
  )

  const setSubProject = useCallback(
    (update: SetStateAction<SubProjectSchema>): void => {
      if (Loadable.get(store.get(electronProjectAtom))?.isDirty !== true) {
        setElectronProject((value) => Loadable.map(value, (loaded) => ({ ...loaded, isDirty: true })))
      }
      computeSubProject(update)
    },
    [computeSubProject, setElectronProject, store],
  )

  const navigateToProjects = useCallback((): void => {
    navigate(electronAppRoutes.projects)
  }, [navigate])

  const navigateToProject = useCallback((): void => {
    const current = Loadable.get(store.get(electronProjectAtom))
    if (!isDefined(current)) {
      throw new Error('No project is open')
    }
    navigate(electronAppRoutes.project(current.filePath))
  }, [navigate, store])

  const navigateToSubProject = useCallback(
    (targetSubProjectId: string): void => {
      const current = Loadable.get(store.get(electronProjectAtom))
      if (!isDefined(current)) {
        throw new Error('No project is open')
      }
      navigate(electronAppRoutes.subProject(current.filePath, targetSubProjectId))
    },
    [navigate, store],
  )

  const value = useMemo<EditorContextType>(
    () => ({
      retryComputation,
      computedSubProject,
      editingInputId,
      isComputing,
      setEditingInputId,
      navigateToProject,
      navigateToProjects,
      navigateToSubProject,
      project,
      setProject,
      setSubProject,
      subProject,
    }),
    [
      retryComputation,
      computedSubProject,
      editingInputId,
      isComputing,
      setEditingInputId,
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
