import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ProjectFileDropResultSchema } from '../../common/components/common/FileDropzone'
import { toaster } from '../../common/components/Toaster'
import { useTranslation } from '../../common/hooks/useTranslation'
import type { ProjectMigrationContextSchema } from '../../common/schemas/migration'
import { ProjectSchema } from '../../common/schemas/project'
import { loadProjectFromContents } from '../../common/utils/loadProjectFromContents'
import { IdGenerator } from '../../common/utils/random/IdGenerator'
import { webAppRoutes } from '../webAppRoutes'
import { useProjects } from './useProjects'

export type UseWebFileDropHandlerOutput = {
  onDrop: (result: ProjectFileDropResultSchema) => void
}

export const useWebFileDropHandler = (): UseWebFileDropHandlerOutput => {
  const { t } = useTranslation()
  const { addProject, projects } = useProjects()
  const navigate = useNavigate()

  const onDrop = useCallback(
    async (result: ProjectFileDropResultSchema): Promise<void> => {
      if (result.type === 'error') {
        toaster.create({
          closable: true,
          description:
            result.error === 'invalid-file-extension'
              ? t.project.toast.dropProjectFileInvalidExtension
              : t.project.toast.dropProjectFileMultipleFiles,
          type: 'error',
        })
        return
      }

      let project

      try {
        const context: ProjectMigrationContextSchema = { t }
        project = loadProjectFromContents(await result.value.text(), context)
      } catch {
        toaster.create({
          closable: true,
          description: t.project.toast.openFailed,
          type: 'error',
        })
        return
      }

      const idGenerator = new IdGenerator()
      const importedProject: ProjectSchema = {
        ...project,
        id: idGenerator.get('project', new Set([project.id, ...projects.map((candidate) => candidate.id)])),
        name: `${project.name} (${result.value.name})`,
      }

      addProject(importedProject)
      navigate(webAppRoutes.project(importedProject.id))
    },
    [addProject, navigate, projects, t],
  )

  return { onDrop }
}
