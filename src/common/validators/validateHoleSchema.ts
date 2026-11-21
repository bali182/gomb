import type { EditableSchema } from '../schemas/editable'
import type { HoleSchema } from '../schemas/hole'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateHolePositionSchema } from './validateHolePositionSchema'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'

export const validateHoleSchema = (
  input: EditableSchema<HoleSchema>,
  currentValue: HoleSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<HoleSchema> => {
  const nameResult = validateName(input.name, currentValue.name, input.id, context.subProject.holes, context)
  const positionResult = validateHolePositionSchema(input, currentValue, context)
  const widthResult = validateNumber(input.width, currentValue.width, context, { min: 0 })
  const heightResult = validateNumber(input.height, currentValue.height, context, { min: 0 })
  const topLeftRadiusResult = validateNumber(input.topLeftRadius, currentValue.topLeftRadius, context)
  const topRightRadiusResult = validateNumber(input.topRightRadius, currentValue.topRightRadius, context)
  const bottomLeftRadiusResult = validateNumber(input.bottomLeftRadius, currentValue.bottomLeftRadius, context)
  const bottomRightRadiusResult = validateNumber(input.bottomRightRadius, currentValue.bottomRightRadius, context)
  const topStretchResult = validateNumber(input.topStretch, currentValue.topStretch, context)
  const rightStretchResult = validateNumber(input.rightStretch, currentValue.rightStretch, context)
  const bottomStretchResult = validateNumber(input.bottomStretch, currentValue.bottomStretch, context)
  const leftStretchResult = validateNumber(input.leftStretch, currentValue.leftStretch, context)
  const issues: IssuesSchema<HoleSchema> = {
    type: undefined,
    autoWidth: undefined,
    autoHeight: undefined,
    topStretch: topStretchResult.issues,
    rightStretch: rightStretchResult.issues,
    bottomStretch: bottomStretchResult.issues,
    leftStretch: leftStretchResult.issues,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    componentId: undefined,
    height: heightResult.issues,
    id: undefined,
    name: nameResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    width: widthResult.issues,
    xAnchor: positionResult.issues.xAnchor,
    xOffset: positionResult.issues.xOffset,
    yAnchor: positionResult.issues.yAnchor,
    yOffset: positionResult.issues.yOffset,
  }
  const committedValue: HoleSchema = {
    autoWidth: input.autoWidth,
    autoHeight: input.autoHeight,
    topStretch: topStretchResult.committedValue,
    rightStretch: rightStretchResult.committedValue,
    bottomStretch: bottomStretchResult.committedValue,
    leftStretch: leftStretchResult.committedValue,
    type: input.type,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    componentId: input.componentId,
    height: heightResult.committedValue,
    id: currentValue.id,
    name: nameResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    width: widthResult.committedValue,
    ...positionResult.committedValue,
  }

  if (
    !topStretchResult.isValid ||
    !rightStretchResult.isValid ||
    !bottomStretchResult.isValid ||
    !leftStretchResult.isValid ||
    !nameResult.isValid ||
    !positionResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, {
    autoWidth: input.autoWidth,
    autoHeight: input.autoHeight,
    topStretch: topStretchResult.value,
    rightStretch: rightStretchResult.value,
    bottomStretch: bottomStretchResult.value,
    leftStretch: leftStretchResult.value,
    type: input.type,
    bottomLeftRadius: bottomLeftRadiusResult.value,
    bottomRightRadius: bottomRightRadiusResult.value,
    componentId: input.componentId,
    height: heightResult.value,
    id: currentValue.id,
    name: nameResult.value,
    topLeftRadius: topLeftRadiusResult.value,
    topRightRadius: topRightRadiusResult.value,
    width: widthResult.value,
    ...positionResult.value,
  })
}
