import { useCallback, useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router'

import { EditDialog } from '../../common/components/EditDialog'
import { toaster } from '../../common/components/Toaster'
import { LANGUAGE } from '../../common/constants/language'
import { useEditableModel } from '../../common/hooks/useEditableModel'
import { useTranslation2 } from '../../common/hooks/useTranslation2'
import { Loadable } from '../../common/loadable'
import { addSubProject } from '../../common/operations/project/addSubProject'
import type { ProjectSchema } from '../../common/schemas/project'
import type { ProjectBasedValidationContextSchema } from '../../common/schemas/validation'
import { useTranslation } from '../../common/translations/translation'
import { createProject } from '../../common/utils/createProject'
import { hasValidationErrors } from '../../common/utils/hasValidationErrors'
import { isDefined } from '../../common/utils/isDefined'
import { validateProjectSchema } from '../../common/validators/validateProjectSchema'
import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'
import { useCreateProjectFilePath } from '../hooks/useCreateProjectFilePath'
import { ElectronProjectSettingsEditor } from './project-settings-editors/ElectronProjectSettingsEditor'

type ElectronCreateProjectDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ElectronCreateProjectDialog: FC<ElectronCreateProjectDialogProps> = ({ isOpen, onOpenChange }) => {
  const navigate = useNavigate()
  const validationT = useTranslation()
  const { t } = useTranslation2()

  const createEmptyProject = useCallback((): ProjectSchema => {
    return createProject(t.defaultNames.project)
  }, [t.defaultNames.project])

  const [project, setProject] = useState<ProjectSchema>(() => createEmptyProject())

  const resetProject = useCallback((): void => {
    setProject(createEmptyProject())
  }, [createEmptyProject])

  const context = useMemo<ProjectBasedValidationContextSchema>(
    () => ({ language: LANGUAGE, projects: [], t: validationT }),
    [validationT],
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
  const createProjectFilePath = useCreateProjectFilePath(editableValue.name)
  const filePathIssue = Loadable.get(createProjectFilePath.filePathIssue)
  const hasFilePathError = isDefined(filePathIssue) && filePathIssue.severity === 'error'
  const isCreateDisabled =
    hasValidationErrors<ProjectSchema>(validationIssues) ||
    !Loadable.isSettled(createProjectFilePath.filePathIssue) ||
    !Loadable.hasValue(createProjectFilePath.filePathIssue) ||
    hasFilePathError

  const showSaveFailedToast = useCallback((): void => {
    toaster.create({
      description: t.dialogs.createProject.errors?.saveFailed,
      type: 'error',
    })
  }, [t.dialogs.createProject.errors?.saveFailed])

  const handleSubmit = useCallback(async (): Promise<void> => {
    const validationResult = validateProjectSchema(editableValue, project, context)

    if (!validationResult.isValid) {
      showSaveFailedToast()
      return
    }

    const { project: createdProject, subProject: initialSubProject } = addSubProject(validationResult.value, {
      baseRootComponentName: t.defaultNames.rootPanel,
    })

    const response = await electronApi.write({
      contents: JSON.stringify(createdProject, null, 2),
      filePath: createProjectFilePath.filePath,
      type: 'write',
    })

    if (response.type === 'error') {
      showSaveFailedToast()
      return
    }

    onOpenChange(false)
    navigate(electronAppRoutes.subProject(createProjectFilePath.filePath, initialSubProject.id))
  }, [
    context,
    createProjectFilePath.filePath,
    editableValue,
    navigate,
    onOpenChange,
    project,
    showSaveFailedToast,
    t.defaultNames.rootPanel,
  ])

  return (
    <EditDialog
      canSubmit={!isCreateDisabled}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetProject}
      onSubmit={handleSubmit}
      submit={t.dialogs.createProject.positiveAction}
      title={t.dialogs.createProject.title}
    >
      <ElectronProjectSettingsEditor
        editable={editableValue}
        filePath={createProjectFilePath.filePath}
        filePathIssue={createProjectFilePath.filePathIssue}
        isFilePathManuallyModified={createProjectFilePath.isManuallyModified}
        issues={validationIssues}
        onChange={setValue}
        onFilePathChange={createProjectFilePath.onFilePathChange}
        onFilePathReset={createProjectFilePath.onFilePathReset}
        onFilePickerButtonPressed={createProjectFilePath.onFilePickerButtonPressed}
      />
    </EditDialog>
  )
}
