import { useCallback, useMemo } from 'react'

import { LANGUAGE } from '../constants/language'
import { HOT_EDITOR_THROTTLE } from '../constants/throttle'
import type { ComponentSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema, ValidationIssuesSchema } from '../schemas/validation'
import { validateComponentSchema } from '../validators/validateComponentSchema'
import { useComponent } from './useComponent'
import { useEditableModel } from './useEditableModel'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'
import { useSubProjectOperations } from './useSubProjectOperations'
import { useTranslation } from './useTranslation'

export type UseEditableComponentResult = {
  component: ComponentSchema
  editableComponent: EditableSchema<ComponentSchema>
  validationIssues: ValidationIssuesSchema<ComponentSchema>
  setComponent: (component: EditableSchema<ComponentSchema>) => void
}

export const useEditableComponent = (componentId: string): UseEditableComponentResult => {
  const component = useComponent(componentId)

  const { project } = useProject()
  const { computedSubProject, subProject } = useSubProject()
  const { updateComponent } = useSubProjectOperations()
  const { t } = useTranslation()
  const context = useMemo<ComponentBasedValidationContextSchema>(
    () => ({ computedSubProject, language: LANGUAGE, project, subProject, t: t.validation }),
    [computedSubProject, project, subProject, t.validation],
  )

  const commit = useCallback(
    (updatedComponent: ComponentSchema): void => {
      updateComponent(updatedComponent)
    },
    [updateComponent],
  )

  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit,
    context,
    validate: validateComponentSchema,
    value: component,
    throttle: HOT_EDITOR_THROTTLE,
  })

  return {
    component,
    editableComponent: editableValue,
    setComponent: setValue,
    validationIssues,
  }
}
