import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { PocketClusterStitchLineSchema, StitchDirectionSchema } from '../schemas/stitching'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'
import { validateStitchLineCommonConfigOverridesSchema } from './validateStitchLineCommonConfigOverridesSchema'

const stitchDirectionValues: Record<StitchDirectionSchema, boolean> = {
  'end-to-start': true,
  'start-to-end': true,
}

export const validatePocketClusterStitchLineSchema = (
  input: EditableSchema<PocketClusterStitchLineSchema>,
  currentValue: PocketClusterStitchLineSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PocketClusterStitchLineSchema> => {
  const nameResult = validateName(input.name, currentValue.name, input.id, context.subProject.stitchLines, context)
  const commonConfigResult = validateStitchLineCommonConfigOverridesSchema(input, currentValue, context)
  const startOffsetResult = validateNumber(input.startOffset, currentValue.startOffset, context)
  const endOffsetResult = validateNumber(input.endOffset, currentValue.endOffset, context)
  const stitchDirectionResult = validatePrimitiveUnion(
    input.stitchDirection,
    currentValue.stitchDirection,
    stitchDirectionValues,
    context,
  )

  const issues: IssuesSchema<PocketClusterStitchLineSchema> = {
    targetId: undefined,
    targetType: undefined,
    endOffset: endOffsetResult.issues,
    id: undefined,
    name: nameResult.issues,
    startOffset: startOffsetResult.issues,
    stitchDirection: stitchDirectionResult.issues,
    stitchHoleDistance: commonConfigResult.issues.stitchHoleDistance,
    stitchHoleLength: commonConfigResult.issues.stitchHoleLength,
    stitchHoleThickness: commonConfigResult.issues.stitchHoleThickness,
    stitchLineThickness: commonConfigResult.issues.stitchLineThickness,
    stitchMargin: commonConfigResult.issues.stitchMargin,
    type: undefined,
  }

  const committedValue: PocketClusterStitchLineSchema = {
    ...commonConfigResult.committedValue,
    targetType: currentValue.targetType,
    targetId: input.targetId,
    endOffset: endOffsetResult.committedValue,
    id: currentValue.id,
    name: nameResult.committedValue,
    startOffset: startOffsetResult.committedValue,
    stitchDirection: stitchDirectionResult.committedValue,
    type: currentValue.type,
  }

  if (
    !nameResult.isValid ||
    !commonConfigResult.isValid ||
    !startOffsetResult.isValid ||
    !endOffsetResult.isValid ||
    !stitchDirectionResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
