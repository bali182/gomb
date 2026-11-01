import { useCallback, useMemo } from 'react'
import { LANGUAGE } from '../constants/language'
import { HOT_EDITOR_THROTTLE } from '../constants/throttle'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { accessors } from '../utils/accessors'
import { optionalComparators } from '../utils/comparators'
import { validatePocketOpeningSchema } from '../validators/validatePocketOpeningSchema'
import { useEditableModel } from './useEditableModel'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'
import { useSubProjectOperations } from './useSubProjectOperations'
import { useTranslation } from './useTranslation'

export type UseEditablePocketOpeningResult = {
  opening: PocketOpeningSchema
  editableOpening: EditableSchema<PocketOpeningSchema>
  validationIssues: IssuesSchema<PocketOpeningSchema>
  setOpening: (value: EditableSchema<PocketOpeningSchema>) => void
}

export const useEditablePocketOpening = (openingId: string): UseEditablePocketOpeningResult => {
  const { subProject, computedSubProject } = useSubProject()
  const { project } = useProject()
  const { t } = useTranslation()
  const { updatePocketOpening } = useSubProjectOperations()
  const opening = accessors.subProject(subProject).pocketOpening.byId(openingId)
  const context = useMemo<ComponentBasedValidationContextSchema>(
    () => ({ project, subProject, computedSubProject, language: LANGUAGE, t: t.validation }),
    [project, subProject, computedSubProject, t.validation],
  )
  const commit = useCallback((value: PocketOpeningSchema): void => updatePocketOpening(value), [updatePocketOpening])
  const { editableValue, validationIssues, setValue } = useEditableModel({
    value: opening,
    context,
    commit,
    validate: validatePocketOpeningSchema,
    isEqual: optionalComparators.pocketOpening,
    throttle: HOT_EDITOR_THROTTLE,
  })
  return { opening, editableOpening: editableValue, validationIssues, setOpening: setValue }
}
