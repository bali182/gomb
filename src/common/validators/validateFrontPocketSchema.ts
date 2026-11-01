import type { FrontPocketSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePocketItemSchema } from './validatePocketItemSchema'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'
export const validateFrontPocketSchema = (
  input: EditableSchema<FrontPocketSchema>,
  currentValue: FrontPocketSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<FrontPocketSchema> => {
  const nameResult = validateName(
    input.name,
    currentValue.name,
    currentValue.id,
    Object.values(context.subProject.components),
    context,
  )
  const colorResult = validateOptionalHexColor(input.color, currentValue.color, context)
  const layoutOrientationResult = validatePrimitiveUnion(
    input.layoutOrientation,
    currentValue.layoutOrientation,
    { horizontal: true, vertical: true },
    context,
  )
  const mainAxisAnchorResult = validatePrimitiveUnion(
    input.mainAxisAnchor,
    currentValue.mainAxisAnchor,
    { start: true, middle: true, end: true },
    context,
  )
  const layoutGapResult = validateNumber(input.layoutGap, currentValue.layoutGap, context, { min: 0 })
  const topLeftRadiusResult = validateNumber(input.topLeftRadius, currentValue.topLeftRadius, context, { min: 0 })
  const topRightRadiusResult = validateNumber(input.topRightRadius, currentValue.topRightRadius, context, { min: 0 })
  const bottomLeftRadiusResult = validateNumber(input.bottomLeftRadius, currentValue.bottomLeftRadius, context, {
    min: 0,
  })
  const bottomRightRadiusResult = validateNumber(input.bottomRightRadius, currentValue.bottomRightRadius, context, {
    min: 0,
  })
  const pocketItemResult = validatePocketItemSchema(input, currentValue, context)

  const issues: IssuesSchema<FrontPocketSchema> = {
    ...pocketItemResult.issues,
    name: nameResult.issues,
    color: colorResult.issues,
    layoutOrientation: layoutOrientationResult.issues,
    mainAxisAnchor: mainAxisAnchorResult.issues,
    layoutGap: layoutGapResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    openingId: undefined,
  }
  const committedValue: FrontPocketSchema = {
    ...currentValue,
    ...pocketItemResult.committedValue,
    name: nameResult.committedValue,
    color: colorResult.committedValue,
    layoutOrientation: layoutOrientationResult.committedValue,
    mainAxisAnchor: mainAxisAnchorResult.committedValue,
    layoutGap: layoutGapResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    openingId: input.openingId,
    individualRadii: input.individualRadii,
    autoLayoutGap: input.autoLayoutGap,
  }
  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !layoutOrientationResult.isValid ||
    !mainAxisAnchorResult.isValid ||
    !layoutGapResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid ||
    !pocketItemResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(issues, committedValue)
}
