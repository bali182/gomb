import { useMemo } from 'react'

import { LANGUAGE } from '../constants/language'
import type { EditableSchema } from '../schemas/editable'
import type { ProjectSchema } from '../schemas/project'
import type { ProjectBasedValidationContextSchema, ValidationIssuesSchema } from '../schemas/validation'
import { optionalComparators } from '../utils/comparators'
import { validateProjectSchema } from '../validators/validateProjectSchema'
import { useEditableModel } from './useEditableModel'
import { useProject } from './useProject'
import { useProjectOperations } from './useProjectOperations'
import { useTranslation2 } from './useTranslation2'

export type UseEditableProjectResult = {
  editableProject: EditableSchema<ProjectSchema>
  project: ProjectSchema
  setProject: (project: EditableSchema<ProjectSchema>) => void
  validationIssues: ValidationIssuesSchema<ProjectSchema>
}

export const useEditableProject = (projects: readonly ProjectSchema[]): UseEditableProjectResult => {
  const { project } = useProject()
  const { updateProject } = useProjectOperations()
  const { t } = useTranslation2()
  const context = useMemo<ProjectBasedValidationContextSchema>(
    () => ({ language: LANGUAGE, projects, t: t.validation }),
    [projects, t.validation],
  )
  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit: updateProject,
    context,
    isEqual: optionalComparators.project,
    validate: validateProjectSchema,
    value: project,
  })

  return {
    editableProject: editableValue,
    project,
    setProject: setValue,
    validationIssues,
  }
}
