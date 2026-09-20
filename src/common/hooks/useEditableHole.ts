import { useCallback, useMemo } from 'react'

import { LANGUAGE } from '../constants/language'
import type { EditableSchema } from '../schemas/editable'
import type { HoleSchema } from '../schemas/hole'
import type { ComponentBasedValidationContextSchema, ValidationIssuesSchema } from '../schemas/validation'
import { validateHoleSchema } from '../validators/validateHoleSchema'
import { useEditableModel } from './useEditableModel'
import { useHole } from './useHole'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'
import { useSubProjectOperations } from './useSubProjectOperations'
import { useTranslation } from './useTranslation'

export type UseEditableHoleResult = {
  editableHole: EditableSchema<HoleSchema>
  hole: HoleSchema
  setHole: (hole: EditableSchema<HoleSchema>) => void
  validationIssues: ValidationIssuesSchema<HoleSchema>
}

export const useEditableHole = (holeId: string): UseEditableHoleResult => {
  const hole = useHole(holeId)
  const { project } = useProject()
  const { computedSubProject, subProject } = useSubProject()
  const { updateHole } = useSubProjectOperations()
  const { t } = useTranslation()
  const context = useMemo<ComponentBasedValidationContextSchema>(
    () => ({ computedSubProject, language: LANGUAGE, project, subProject, t: t.validation }),
    [computedSubProject, project, subProject, t.validation],
  )
  const commit = useCallback(
    (updatedHole: HoleSchema): void => {
      updateHole(updatedHole)
    },
    [updateHole],
  )
  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit,
    context,
    validate: validateHoleSchema,
    value: hole,
  })

  return {
    editableHole: editableValue,
    hole,
    setHole: setValue,
    validationIssues,
  }
}
