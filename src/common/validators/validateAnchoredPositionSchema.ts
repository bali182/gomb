import type { AnchorSchema, HasAnchorsSchema, HasXYOffsetSchema } from '../schemas/common'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

const anchorValues: Record<AnchorSchema, boolean> = {
  start: true,
  middle: true,
  end: true,
}

export const validateAnchoredPositionSchema = (
  input: EditableSchema<HasAnchorsSchema & HasXYOffsetSchema>,
  currentValue: HasAnchorsSchema & HasXYOffsetSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<HasAnchorsSchema & HasXYOffsetSchema> => {
  const xAnchorResult = validatePrimitiveUnion(input.xAnchor, currentValue.xAnchor, anchorValues, context)
  const yAnchorResult = validatePrimitiveUnion(input.yAnchor, currentValue.yAnchor, anchorValues, context)
  const xOffsetResult = validateNumber(input.xOffset, currentValue.xOffset, context)
  const yOffsetResult = validateNumber(input.yOffset, currentValue.yOffset, context)

  const issues: IssuesSchema<HasAnchorsSchema & HasXYOffsetSchema> = {
    xAnchor: xAnchorResult.issues,
    xOffset: xOffsetResult.issues,
    yAnchor: yAnchorResult.issues,
    yOffset: yOffsetResult.issues,
  }
  const committedValue: HasAnchorsSchema & HasXYOffsetSchema = {
    xAnchor: xAnchorResult.committedValue,
    xOffset: xOffsetResult.committedValue,
    yAnchor: yAnchorResult.committedValue,
    yOffset: yOffsetResult.committedValue,
  }

  if (!xAnchorResult.isValid || !yAnchorResult.isValid || !xOffsetResult.isValid || !yOffsetResult.isValid) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, {
    xAnchor: xAnchorResult.value,
    xOffset: xOffsetResult.value,
    yAnchor: yAnchorResult.value,
    yOffset: yOffsetResult.value,
  })
}
