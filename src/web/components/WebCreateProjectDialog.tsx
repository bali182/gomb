import { useCallback, useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router'

import { EditDialog } from '../../common/components/EditDialog'
import { LANGUAGE } from '../../common/constants/language'
import { useEditableModel } from '../../common/hooks/useEditableModel'
import { useTranslation2 } from '../../common/hooks/useTranslation2'
import { addSubProject } from '../../common/operations/project/addSubProject'
import { getUnusedName } from '../../common/operations/subProject/utils/getUnusedName'
import type { ProjectSchema } from '../../common/schemas/project'
import type { ProjectBasedValidationContextSchema } from '../../common/schemas/validation'
import { createProject } from '../../common/utils/createProject'
import { hasValidationErrors } from '../../common/utils/hasValidationErrors'
import { validateProjectSchema } from '../../common/validators/validateProjectSchema'
import { useProjects } from '../hooks/useProjects'
import { webAppRoutes } from '../webAppRoutes'
import { WebProjectSettingsEditor } from './project-settings-editors/WebProjectSettingsEditor'

type WebCreateProjectDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const WebCreateProjectDialog: FC<WebCreateProjectDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addProject, projects } = useProjects()
  const navigate = useNavigate()
  const { t } = useTranslation2()

  const createEmptyProject = useCallback((): ProjectSchema => {
    return createProject(
      getUnusedName(t.defaultNames.project, new Set(projects.map((project): string => project.name))),
    )
  }, [projects, t.defaultNames.project])

  const [project, setProject] = useState<ProjectSchema>(() => createEmptyProject())

  const resetProject = useCallback((): void => {
    setProject(createEmptyProject())
  }, [createEmptyProject])

  const context = useMemo<ProjectBasedValidationContextSchema>(
    () => ({ language: LANGUAGE, projects, t: t.validation }),
    [projects, t.validation],
  )

  const commit = useCallback((updatedProject: ProjectSchema): void => {
    setProject(updatedProject)
  }, [])

  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit,
    context,
    validate: validateProjectSchema,
    value: project,
  })

  const hasErrors = useMemo<boolean>(() => hasValidationErrors<ProjectSchema>(validationIssues), [validationIssues])

  const handleSubmit = useCallback((): void => {
    const validationResult = validateProjectSchema(editableValue, project, context)

    if (!validationResult.isValid) {
      return
    }

    const { project: createdProject, subProject: initialSubProject } = addSubProject(validationResult.value, {
      baseRootComponentName: t.defaultNames.rootPanel,
    })
    addProject(createdProject)
    onOpenChange(false)
    navigate(webAppRoutes.subProject(createdProject.id, initialSubProject.id))
  }, [addProject, context, editableValue, navigate, onOpenChange, project, t.defaultNames.rootPanel])

  return (
    <EditDialog
      canSubmit={!hasErrors}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetProject}
      onSubmit={handleSubmit}
      submit={t.dialogs.createProject.positiveAction}
      title={t.dialogs.createProject.title}
    >
      <WebProjectSettingsEditor editable={editableValue} issues={validationIssues} onChange={setValue} />
    </EditDialog>
  )
}
