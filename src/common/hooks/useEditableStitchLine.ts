import { useCallback, useMemo } from 'react'

import { LANGUAGE } from '../constants/language'
import { HOT_EDITOR_THROTTLE } from '../constants/throttle'
import type { EditableSchema } from '../schemas/editable'
import type { StitchLineCommonConfigSchema, StitchLineSchema } from '../schemas/stitching'
import type { ComponentBasedValidationContextSchema, ValidationIssuesSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateStitchLineSchema } from '../validators/validateStitchLineSchema'
import { useEditableModel } from './useEditableModel'
import { useProject } from './useProject'
import { useStitchLine } from './useStitchLine'
import { useSubProject } from './useSubProject'
import { useSubProjectOperations } from './useSubProjectOperations'
import { useTranslation } from './useTranslation'

export type UseEditableStitchLineResult = {
  editableStitchLine: EditableSchema<StitchLineSchema>
  resolvedEditableStitchLine: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<StitchLineSchema>
  setStitchLine: (stitchLine: EditableSchema<StitchLineSchema>) => void
  stitchLine: StitchLineSchema
  validationIssues: ValidationIssuesSchema<StitchLineSchema>
}

export const useEditableStitchLine = (stitchLineId: string): UseEditableStitchLineResult => {
  const stitchLine = useStitchLine(stitchLineId)

  const { project } = useProject()
  const { computedSubProject, subProject } = useSubProject()
  const { updateStitchLine } = useSubProjectOperations()
  const { t } = useTranslation()
  const context = useMemo<ComponentBasedValidationContextSchema>(
    () => ({ computedSubProject, language: LANGUAGE, project, subProject, t: t.validation }),
    [computedSubProject, project, subProject, t.validation],
  )

  const commit = useCallback(
    (updatedStitchLine: StitchLineSchema): void => {
      updateStitchLine(updatedStitchLine)
    },
    [updateStitchLine],
  )

  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit,
    context,
    validate: validateStitchLineSchema,
    value: stitchLine,
    throttle: HOT_EDITOR_THROTTLE,
  })
  const resolvedEditableStitchLine = useMemo(
    () => ({
      ...getEditableSchema(project.stitchingSettings, { language: LANGUAGE }),
      ...editableValue,
    }),
    [editableValue, project.stitchingSettings],
  )

  return {
    editableStitchLine: editableValue,
    resolvedEditableStitchLine,
    setStitchLine: setValue,
    stitchLine,
    validationIssues,
  }
}
