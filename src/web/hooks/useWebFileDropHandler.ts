import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ProjectFileDropResultSchema } from '../../common/components/common/FileDropzone'
import { toaster } from '../../common/components/Toaster'
import { FILE_EXTENSION } from '../../common/constants/fileExtension'
import { useTranslation } from '../../common/hooks/useTranslation'
import { ProjectSchema } from '../../common/schemas/project'
import { id } from '../../common/utils/id'
import { parseProjectFileContents } from '../../common/utils/parseProjectFileContents'
import { webAppRoutes } from '../webAppRoutes'
import { useProjects } from './useProjects'

export type UseWebFileDropHandlerOutput = {
  onDrop: (result: ProjectFileDropResultSchema) => void
}

export const useWebFileDropHandler = (): UseWebFileDropHandlerOutput => {
  const { t } = useTranslation()
  const { addProject } = useProjects()
  const navigate = useNavigate()

  const onDrop = useCallback(
    async (result: ProjectFileDropResultSchema): Promise<void> => {
      if (result.type === 'error') {
        toaster.create({
          closable: true,
          description:
            result.error === 'invalid-file-extension'
              ? t.projects.dnd.dropProjectFileInvalidExtension
              : t.projects.dnd.dropProjectFileMultipleFiles,
          type: 'error',
        })
        return
      }

      let project

      try {
        project = parseProjectFileContents(await result.value.text())
      } catch {
        toaster.create({
          closable: true,
          description: t.project.toast.openFailed,
          type: 'error',
        })
        return
      }

      const importedProject: ProjectSchema = {
        ...project,
        id: createImportedProjectId(result.value.name),
        name: `${project.name} (${result.value.name})`,
      }

      addProject(importedProject)
      navigate(webAppRoutes.project(importedProject.id))
    },
    [
      addProject,
      navigate,
      t.project.toast.openFailed,
      t.projects.dnd.dropProjectFileInvalidExtension,
      t.projects.dnd.dropProjectFileMultipleFiles,
    ],
  )

  return { onDrop }
}

const createImportedProjectId = (fileName: string): string => {
  const nameWithoutExtension = fileName.replace(new RegExp(`\\.${FILE_EXTENSION}$`, 'i'), '')
  return `${nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '')}${id()}`
}
