import { useAtom, useStore } from 'jotai'
import { useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { accessors } from '../../common/utils/accessors'

import { toaster } from '../../common/components/Toaster'
import { GOMB_EXTENSION } from '../../common/constants/fileExtensions'
import { useTranslation } from '../../common/hooks/useTranslation'
import { Loadable } from '../../common/loadable'
import type { EditorComputationControlSchema } from '../../common/schemas/editorComputation'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { ProjectMigrationContextSchema } from '../../common/schemas/migration'
import type { ProjectSchema } from '../../common/schemas/project'
import { id } from '../../common/utils/id'
import { isDefined } from '../../common/utils/isDefined'
import { loadProjectFromContents } from '../../common/utils/loadProjectFromContents'
import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'
import type { ElectronProjectSchema } from '../schemas/electronProject'
import type { ElectronSubProjectRouteParamsSchema } from '../schemas/electronRouteParams'
import { electronComputationAtom } from '../state/electronComputationAtom'
import { electronProjectAtom } from '../state/electronProjectAtom'

type PreparedProjectSave = {
  source: ElectronProjectSchema
  target: ElectronProjectSchema
  control: EditorComputationControlSchema | undefined
  requestId: number | undefined
}

type UseElectronProjectSchema = {
  electronProject: LoadableSchema<ElectronProjectSchema>
  loadProject: () => Promise<void>
  openProject: () => Promise<void>
  saveProject: () => Promise<boolean>
  saveProjectAs: () => Promise<void>
}

export const useElectronProject = (filePath?: string): UseElectronProjectSchema => {
  const [electronProject, setElectronProject] = useAtom(electronProjectAtom)
  const store = useStore()
  const requestIdRef = useRef(0)
  const navigate = useNavigate()
  const { subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const { t } = useTranslation()

  const showOpenFailedToast = useCallback((): void => {
    toaster.create({
      description: t.project.toast.openFailed,
      type: 'error',
      closable: true,
    })
  }, [t.project.toast.openFailed])

  const showSaveFailedToast = useCallback((): void => {
    toaster.create({
      description: t.project.toast.saveFailed,
      type: 'error',
      closable: true,
    })
  }, [t.project.toast.saveFailed])

  const showSaveSucceededToast = useCallback((): void => {
    toaster.create({
      description: t.project.toast.saveSucceeded,
      type: 'info',
      duration: 2000,
      closable: true,
    })
  }, [t.project.toast.saveSucceeded])

  const prepareSave = useCallback(async (): Promise<PreparedProjectSave | undefined> => {
    const source = Loadable.get(store.get(electronProjectAtom))
    if (!isDefined(source)) {
      return undefined
    }
    const control = store.get(electronComputationAtom)
    try {
      const result = isDefined(control) ? await control.waitUntilIdle() : undefined
      const current = Loadable.get(store.get(electronProjectAtom))
      if (
        !isDefined(current) ||
        current.filePath !== source.filePath ||
        current.project.id !== source.project.id ||
        store.get(electronComputationAtom) !== control
      ) {
        return undefined
      }
      return {
        source,
        target: { ...source, isDirty: false, project: isDefined(result) ? result.project : source.project },
        control,
        requestId: result?.requestId,
      }
    } catch {
      showSaveFailedToast()
      return undefined
    }
  }, [showSaveFailedToast, store])

  const writeProject = useCallback(
    async ({ source, target, control, requestId }: PreparedProjectSave): Promise<boolean> => {
      const response = await electronApi.write({
        contents: JSON.stringify(target.project, null, 2),
        filePath: target.filePath,
        type: 'write',
      })

      if (response.type === 'error') {
        showSaveFailedToast()
        return false
      }

      let adopted = false
      setElectronProject((current) =>
        Loadable.map(current, (loaded) => {
          if (
            loaded.filePath !== source.filePath ||
            loaded.project.id !== source.project.id ||
            store.get(electronComputationAtom) !== control ||
            (isDefined(control) && control.getRequestId() !== requestId) ||
            (!isDefined(control) && loaded.project !== source.project && loaded.project !== target.project)
          ) {
            return loaded
          }
          adopted = true
          return target
        }),
      )

      return adopted
    },
    [setElectronProject, showSaveFailedToast, store],
  )

  const loadProject = useCallback(async (): Promise<void> => {
    if (!isDefined(filePath)) {
      return
    }

    const requestId = ++requestIdRef.current

    setElectronProject((currentElectronProject): LoadableSchema<ElectronProjectSchema> => {
      if (currentElectronProject.type === 'loaded' && currentElectronProject.data.filePath === filePath) {
        return Loadable.loadingWith(currentElectronProject.data)
      }
      return Loadable.loading()
    })

    const response = await electronApi.read({ filePath, type: 'read' })

    if (requestId !== requestIdRef.current) {
      return
    }

    if (response.type === 'error') {
      setElectronProject(Loadable.failed(response))
      return
    }

    let project: ProjectSchema

    try {
      const context: ProjectMigrationContextSchema = { t }
      project = loadProjectFromContents(response.contents, context)
    } catch {
      setElectronProject(Loadable.failed())
      return
    }

    setElectronProject(
      Loadable.loaded({
        filePath,
        isDirty: false,
        project,
      }),
    )
  }, [filePath, setElectronProject, t])

  const navigateToProject = useCallback(
    (filePath: string, project: ProjectSchema, preferredSubProjectId?: string): void => {
      const selectedSubProject = isDefined(preferredSubProjectId)
        ? accessors.project(project).optional.subProject(preferredSubProjectId)
        : undefined
      const fallbackSubProject = project.subProjects[0]
      const targetSubProject = isDefined(selectedSubProject) ? selectedSubProject : fallbackSubProject

      if (!isDefined(targetSubProject)) {
        navigate(electronAppRoutes.project(filePath))
        return
      }

      navigate(electronAppRoutes.subProject(filePath, targetSubProject.id))
    },
    [navigate],
  )

  const openProject = useCallback(async (): Promise<void> => {
    const response = await electronApi.dialog({
      buttonLabel: t.nativeDialogs.openProjectPath.positiveAction,
      fileFilter: {
        extension: GOMB_EXTENSION,
        name: t.nativeDialogs.openProjectPath.extensionName,
      },
      target: 'file',
      title: t.nativeDialogs.openProjectPath.title,
      type: 'read',
    })

    if (response.type === 'error') {
      showOpenFailedToast()
      return
    }

    if (response.type === 'cancelled') {
      return
    }

    navigate(electronAppRoutes.project(response.filePath))
  }, [
    navigate,
    showOpenFailedToast,
    t.nativeDialogs.openProjectPath.extensionName,
    t.nativeDialogs.openProjectPath.positiveAction,
    t.nativeDialogs.openProjectPath.title,
  ])

  const saveProject = useCallback(async (): Promise<boolean> => {
    const prepared = await prepareSave()
    if (!isDefined(prepared)) {
      return false
    }

    const hasSaved = await writeProject(prepared)

    if (hasSaved) {
      showSaveSucceededToast()
    }
    return hasSaved
  }, [prepareSave, showSaveSucceededToast, writeProject])

  const saveProjectAs = useCallback(async (): Promise<void> => {
    const loadedElectronProject = Loadable.get(store.get(electronProjectAtom))

    if (!isDefined(loadedElectronProject)) {
      return
    }

    const response = await electronApi.dialog({
      buttonLabel: t.nativeDialogs.saveProjectAsPath.positiveAction,
      fileFilter: {
        extension: GOMB_EXTENSION,
        name: t.nativeDialogs.saveProjectAsPath.extensionName,
      },
      title: t.nativeDialogs.saveProjectAsPath.title,
      type: 'write',
    })

    if (response.type === 'error') {
      showSaveFailedToast()
      return
    }

    if (response.type === 'cancelled') {
      return
    }

    const prepared = await prepareSave()
    if (
      !isDefined(prepared) ||
      prepared.source.project.id !== loadedElectronProject.project.id ||
      prepared.source.filePath !== loadedElectronProject.filePath
    ) {
      return
    }
    const target: ElectronProjectSchema = {
      filePath: response.filePath,
      isDirty: false,
      project: {
        ...prepared.target.project,
        id: id(),
      },
    }

    const hasSaved = await writeProject({ ...prepared, target })

    if (!hasSaved) {
      return
    }

    navigateToProject(target.filePath, target.project, subProjectId)
  }, [
    navigateToProject,
    prepareSave,
    showSaveFailedToast,
    subProjectId,
    store,
    t.nativeDialogs.saveProjectAsPath.extensionName,
    t.nativeDialogs.saveProjectAsPath.positiveAction,
    t.nativeDialogs.saveProjectAsPath.title,
    writeProject,
  ])

  return { electronProject, loadProject, openProject, saveProject, saveProjectAs }
}
