import type { RootPanelFaceSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { accessors } from '../utils/accessors'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validateRootPanelFaceSchema = (
  input: EditableSchema<RootPanelFaceSchema>,
  currentValue: RootPanelFaceSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<RootPanelFaceSchema> => {
  const name = validateName(
    input.name,
    currentValue.name,
    currentValue.id,
    accessors.subProject(context.subProject).component.components(),
    context,
  )
  const orientation = validatePrimitiveUnion(
    input.layoutOrientation,
    currentValue.layoutOrientation,
    { horizontal: true, vertical: true },
    context,
  )
  const anchor = validatePrimitiveUnion(
    input.mainAxisAnchor,
    currentValue.mainAxisAnchor,
    { start: true, middle: true, end: true },
    context,
  )
  const gap = validateNumber(input.layoutGap, currentValue.layoutGap, context, { min: 0 })
  const issues: IssuesSchema<RootPanelFaceSchema> = {
    id: undefined,
    name: name.issues,
    type: undefined,
    children: input.children.map(() => undefined),
    layoutOrientation: orientation.issues,
    mainAxisAnchor: anchor.issues,
    layoutGap: gap.issues,
    autoLayoutGap: undefined,
  }
  const committedValue: RootPanelFaceSchema = {
    ...currentValue,
    name: name.committedValue,
    layoutOrientation: orientation.committedValue,
    mainAxisAnchor: anchor.committedValue,
    layoutGap: gap.committedValue,
    autoLayoutGap: input.autoLayoutGap,
  }
  if (!name.isValid || !orientation.isValid || !anchor.isValid || !gap.isValid) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(
    issues,
    {
      ...committedValue,
      name: name.value,
      layoutOrientation: orientation.value,
      mainAxisAnchor: anchor.value,
      layoutGap: gap.value,
    },
    committedValue,
  )
}
