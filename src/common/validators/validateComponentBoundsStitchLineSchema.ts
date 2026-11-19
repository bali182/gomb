import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBoundsStitchLineSchema, StitchDirectionSchema } from '../schemas/stitching'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'
import { validateStitchLineCommonConfigOverridesSchema } from './validateStitchLineCommonConfigOverridesSchema'

const stitchDirectionValues: Record<StitchDirectionSchema, boolean> = {
  'start-to-end': true,
  'end-to-start': true,
}

export const validateComponentBoundsStitchLineSchema = (
  input: EditableSchema<ComponentBoundsStitchLineSchema>,
  currentValue: ComponentBoundsStitchLineSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<ComponentBoundsStitchLineSchema> => {
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
  const topLeftRadiusResult = validateNumber(input.topLeftRadius, currentValue.topLeftRadius, context, { min: 0 })
  const topRightRadiusResult = validateNumber(input.topRightRadius, currentValue.topRightRadius, context, { min: 0 })
  const bottomLeftRadiusResult = validateNumber(input.bottomLeftRadius, currentValue.bottomLeftRadius, context, {
    min: 0,
  })
  const bottomRightRadiusResult = validateNumber(input.bottomRightRadius, currentValue.bottomRightRadius, context, {
    min: 0,
  })

  const issues: IssuesSchema<ComponentBoundsStitchLineSchema> = {
    startOffset: startOffsetResult.issues,
    endOffset: endOffsetResult.issues,
    stitchDirection: stitchDirectionResult.issues,
    bottom: undefined,
    bottomLeftCorner: undefined,
    bottomRightCorner: undefined,
    targetId: undefined,
    targetType: undefined,
    id: undefined,
    left: undefined,
    name: nameResult.issues,
    right: undefined,
    stitchHoleDistance: commonConfigResult.issues.stitchHoleDistance,
    stitchHoleLength: commonConfigResult.issues.stitchHoleLength,
    stitchHoleThickness: commonConfigResult.issues.stitchHoleThickness,
    stitchLineThickness: commonConfigResult.issues.stitchLineThickness,
    stitchMargin: commonConfigResult.issues.stitchMargin,
    type: undefined,
    exitComponentId: undefined,
    top: undefined,
    topLeftCorner: undefined,
    topRightCorner: undefined,
    autoCornerRadius: undefined,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    entryComponentId: undefined,
  }

  const committedValue: ComponentBoundsStitchLineSchema = {
    ...commonConfigResult.committedValue,
    startOffset: startOffsetResult.committedValue,
    endOffset: endOffsetResult.committedValue,
    stitchDirection: stitchDirectionResult.committedValue,
    bottom: input.bottom,
    bottomLeftCorner: input.bottomLeftCorner,
    bottomRightCorner: input.bottomRightCorner,
    targetType: currentValue.targetType,
    targetId: input.targetId,
    id: currentValue.id,
    left: input.left,
    name: nameResult.committedValue,
    right: input.right,
    top: input.top,
    topLeftCorner: input.topLeftCorner,
    topRightCorner: input.topRightCorner,
    type: currentValue.type,
    exitComponentId: input.exitComponentId,
    autoCornerRadius: input.autoCornerRadius,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    entryComponentId: input.entryComponentId,
  }

  if (
    !startOffsetResult.isValid ||
    !endOffsetResult.isValid ||
    !stitchDirectionResult.isValid ||
    !nameResult.isValid ||
    !commonConfigResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
