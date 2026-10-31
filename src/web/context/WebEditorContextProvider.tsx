import { useAtom, useStore } from 'jotai'
import { useCallback, useEffect, useMemo, useState, type FC, type PropsWithChildren, type SetStateAction } from 'react'
import { useNavigate, useParams } from 'react-router'

import { EditorContext, type EditorContextType } from '../../common/contexts/EditorContext'
import { useClearSubProjectHistory } from '../../common/hooks/useClearSubProjectHistory'
import { useEditorComputation } from '../../common/hooks/useEditorComputation'
import { Loadable } from '../../common/loadable'
import type { ProjectSchema } from '../../common/schemas/project'
import type { SubProjectSchema } from '../../common/schemas/subProject'
import { accessors } from '../../common/utils/accessors'
import { isDefined } from '../../common/utils/isDefined'
import type { WebSubProjectRouteParamsSchema } from '../schemas/webRouteParams'
import { projectsAtom } from '../state/projectsAtom'
import { webAppRoutes } from '../webAppRoutes'

export const WebEditorContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { projectId, subProjectId } = useParams<WebSubProjectRouteParamsSchema>()
  const navigate = useNavigate()
  const store = useStore()
  const [projects, setProjects] = useAtom(projectsAtom)
  const { clearSubProjectHistory } = useClearSubProjectHistory()
  const storedProject = useMemo<ProjectSchema | undefined>(
    () => projects.find((candidate) => candidate.id === projectId),
    [projectId, projects],
  )
  const {
    state,
    setProject: computeProject,
    setSubProject: computeSubProject,
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
  const computedSubProject = result?.computedSubProject

  useEffect(() => {
    clearSubProjectHistory()
  }, [clearSubProjectHistory, project?.id])

  useEffect(() => {
    if (state.result.type !== 'loaded') {
      return
    }
    const updatedProject = state.result.data.project
    setProjects((currentProjects) =>
      currentProjects.map((candidate) => (candidate.id === updatedProject.id ? updatedProject : candidate)),
    )
  }, [setProjects, state.result])

  const subProject = useMemo<SubProjectSchema | undefined>(
    () =>
      isDefined(project) && isDefined(subProjectId)
        ? accessors.project(project).optional.subProject(subProjectId)
        : undefined,
    [project, subProjectId],
  )
  const setProject = useCallback(
    (update: SetStateAction<ProjectSchema>): void => {
      const currentProject = store.get(projectsAtom).find((candidate) => candidate.id === projectId)
      if (!isDefined(currentProject)) {
        throw new Error('No project is selected')
      }
      const updatedProject = typeof update === 'function' ? update(currentProject) : update
      if (isDefined(subProjectId) && isDefined(accessors.project(updatedProject).optional.subProject(subProjectId))) {
        computeProject(updatedProject)
        return
      }
      setProjects((currentProjects) =>
        currentProjects.map((candidate) => (candidate.id === currentProject.id ? updatedProject : candidate)),
      )
    },
    [computeProject, projectId, setProjects, store, subProjectId],
  )

  const setSubProject = useCallback(
    (update: SetStateAction<SubProjectSchema>): void => {
      computeSubProject(update)
    },
    [computeSubProject],
  )

  const navigateToProjects = useCallback((): void => {
    navigate(webAppRoutes.projects)
  }, [navigate])

  const navigateToProject = useCallback((): void => {
    if (!isDefined(projectId)) {
      throw new Error('No project is selected')
    }
    navigate(webAppRoutes.project(projectId))
  }, [navigate, projectId])

  const navigateToSubProject = useCallback(
    (targetSubProjectId: string): void => {
      if (!isDefined(projectId)) {
        throw new Error('No project is selected')
      }
      navigate(webAppRoutes.subProject(projectId, targetSubProjectId))
    },
    [navigate, projectId],
  )

  const value = useMemo<EditorContextType>(
    () => ({
      computation: state,
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
      state,
      subProject,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
