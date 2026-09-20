import { useMemo } from 'react'

import { LANGUAGE } from '../constants/language'
import type { EditableSchema } from '../schemas/editable'
import type { ProjectSchema } from '../schemas/project'
import type { ProjectBasedValidationContextSchema, ValidationIssuesSchema } from '../schemas/validation'
import { useTranslation } from '../translations/translation'
import { optionalComparators } from '../utils/comparators'
import { validateProjectSchema } from '../validators/validateProjectSchema'
import { useEditableModel } from './useEditableModel'
import { useProject } from './useProject'
import { useProjectOperations } from './useProjectOperations'

export type UseEditableProjectResult = {
  editableProject: EditableSchema<ProjectSchema>
  project: ProjectSchema
  setProject: (project: EditableSchema<ProjectSchema>) => void
  validationIssues: ValidationIssuesSchema<ProjectSchema>
}

export const useEditableProject = (projects: readonly ProjectSchema[]): UseEditableProjectResult => {
  const { project } = useProject()
  const { updateProject } = useProjectOperations()
  const validationT = useTranslation()
  const context = useMemo<ProjectBasedValidationContextSchema>(
    () => ({ language: LANGUAGE, projects, t: validationT }),
    [projects, validationT],
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
