import { useAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import typia from 'typia'

import { toaster } from '../../common/components/Toaster'
import { Loadable } from '../../common/loadable'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { ProjectSchema } from '../../common/schemas/project'
import { useTranslation } from '../../common/translations/translation'
import { id } from '../../common/utils/id'
import { isDefined } from '../../common/utils/isDefined'
import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'
import { FILE_EXTENSION } from '../fileExtension'
import type { ElectronProjectSchema } from '../schemas/electronProject'
import type { ElectronSubProjectRouteParamsSchema } from '../schemas/electronRouteParams'
import { electronProjectAtom } from '../state/electronProjectAtom'

type UseElectronProjectSchema = {
  electronProject: LoadableSchema<ElectronProjectSchema>
  loadProject: () => Promise<void>
  openProject: () => Promise<void>
  saveProject: () => Promise<void>
  saveProjectAs: () => Promise<void>
}

export const useElectronProject = (filePath?: string): UseElectronProjectSchema => {
  const [electronProject, setElectronProject] = useAtom(electronProjectAtom)
  const requestIdRef = useRef(0)
  const navigate = useNavigate()
  const { subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const t = useTranslation()

  const showOpenFailedToast = useCallback((): void => {
    toaster.create({
      description: t.projects.openDialog.errors.openFailed,
      type: 'error',
      closable: true,
    })
  }, [t.projects.openDialog.errors.openFailed])

  const showSaveFailedToast = useCallback((): void => {
    toaster.create({
      description: t.projects.saveDialog.errors.saveFailed,
      type: 'error',
      closable: true,
    })
  }, [t.projects.saveDialog.errors.saveFailed])

  const showSaveSucceededToast = useCallback((): void => {
    toaster.create({
      description: t.projects.saveDialog.successes.saveSucceeded,
      type: 'info',
      duration: 2000,
      closable: true,
    })
  }, [t.projects.saveDialog.successes.saveSucceeded])

  console.log('h')

  const writeProject = useCallback(
    async (target: ElectronProjectSchema): Promise<boolean> => {
      const response = await electronApi.write({
        contents: JSON.stringify(target.project, null, 2),
        filePath: target.filePath,
        type: 'write',
      })

      if (response.type === 'error') {
        showSaveFailedToast()
        return false
      }

      setElectronProject(Loadable.loaded(target))

      return true
    },
    [setElectronProject, showSaveFailedToast],
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

    let input: unknown

    try {
      input = JSON.parse(response.contents)
    } catch {
      setElectronProject(Loadable.failed())
      return
    }

    if (!typia.is<ProjectSchema>(input)) {
      setElectronProject(Loadable.failed())
      return
    }

    setElectronProject(
      Loadable.loaded({
        filePath,
        isDirty: false,
        project: input,
      }),
    )
  }, [filePath, setElectronProject])

  const navigateToProject = useCallback(
    (filePath: string, project: ProjectSchema, preferredSubProjectId?: string): void => {
      const selectedSubProject = isDefined(preferredSubProjectId)
        ? project.subProjects.find((candidate) => candidate.id === preferredSubProjectId)
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
      buttonLabel: t.projects.actions.open,
      fileFilter: {
        extension: FILE_EXTENSION,
        name: t.projects.openDialog.fileFilterLabel,
      },
      target: 'file',
      title: t.projects.openDialog.title,
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
    t.projects.actions.open,
    t.projects.openDialog.fileFilterLabel,
    t.projects.openDialog.title,
  ])

  const saveProject = useCallback(async (): Promise<void> => {
    const loadedElectronProject = Loadable.get(electronProject)

    if (!isDefined(loadedElectronProject)) {
      return
    }

    const hasSaved = await writeProject({ ...loadedElectronProject, isDirty: false })

    if (hasSaved) {
      showSaveSucceededToast()
    }
  }, [electronProject, showSaveSucceededToast, writeProject])

  const saveProjectAs = useCallback(async (): Promise<void> => {
    const loadedElectronProject = Loadable.get(electronProject)

    if (!isDefined(loadedElectronProject)) {
      return
    }

    const response = await electronApi.dialog({
      buttonLabel: t.editor.menus.file.file.save,
      fileFilter: {
        extension: FILE_EXTENSION,
        name: t.projects.openDialog.fileFilterLabel,
      },
      title: t.projects.saveDialog.title,
      type: 'write',
    })

    if (response.type === 'error') {
      showSaveFailedToast()
      return
    }

    if (response.type === 'cancelled') {
      return
    }

    const target: ElectronProjectSchema = {
      filePath: response.filePath,
      isDirty: false,
      project: {
        ...loadedElectronProject.project,
        id: id(),
      },
    }

    const hasSaved = await writeProject(target)

    if (!hasSaved) {
      return
    }

    navigateToProject(target.filePath, target.project, subProjectId)
  }, [
    electronProject,
    navigateToProject,
    showSaveFailedToast,
    subProjectId,
    t.editor.menus.file.file.save,
    t.projects.openDialog.fileFilterLabel,
    t.projects.saveDialog.title,
    writeProject,
  ])

  return { electronProject, loadProject, openProject, saveProject, saveProjectAs }
}
