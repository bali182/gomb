import type { PocketClusterSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'
export const validatePocketClusterSchema = (
  input: EditableSchema<PocketClusterSchema>,
  currentValue: PocketClusterSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PocketClusterSchema> => {
  const nameResult = validateName(
    input.name,
    currentValue.name,
    currentValue.id,
    Object.values(context.subProject.components),
    context,
  )
  const colorResult = validateOptionalHexColor(input.color, currentValue.color, context)
  const widthResult = validateNumber(input.width, currentValue.width, context, { min: 0 })
  const heightResult = validateNumber(input.height, currentValue.height, context, { min: 0 })
  const offAxisAnchorResult = validatePrimitiveUnion(
    input.offAxisAnchor,
    currentValue.offAxisAnchor,
    { start: true, middle: true, end: true },
    context,
  )
  const orientationResult = validatePrimitiveUnion(
    input.orientation,
    currentValue.orientation,
    { up: true, down: true, left: true, right: true },
    context,
  )
  const pocketStepResult = validateNumber(input.pocketStep, currentValue.pocketStep, context, {
    min: 0,
    minInclusive: false,
  })
  const cardIdResult = validatePrimitiveUnion(
    input.cardId,
    currentValue.cardId,
    {
      'ID-1-landscape': true,
      'ID-2-landscape': true,
      'ID-3-landscape': true,
      'ID-1-portrait': true,
      'ID-2-portrait': true,
      'ID-3-portrait': true,
    },
    context,
    true,
  )
  const cardCrossAxisOffsetResult = validateNumber(input.cardCrossAxisOffset, currentValue.cardCrossAxisOffset, context)
  const cardOpeningOffsetResult = validateNumber(input.cardOpeningOffset, currentValue.cardOpeningOffset, context, {
    min: 0,
  })
  const topStretchResult = validateNumber(input.topStretch, currentValue.topStretch, context)
  const rightStretchResult = validateNumber(input.rightStretch, currentValue.rightStretch, context)
  const bottomStretchResult = validateNumber(input.bottomStretch, currentValue.bottomStretch, context)
  const leftStretchResult = validateNumber(input.leftStretch, currentValue.leftStretch, context)

  const issues: IssuesSchema<PocketClusterSchema> = {
    name: nameResult.issues,
    color: colorResult.issues,
    width: widthResult.issues,
    height: heightResult.issues,
    offAxisAnchor: offAxisAnchorResult.issues,
    orientation: orientationResult.issues,
    pocketStep: pocketStepResult.issues,
    cardId: cardIdResult.issues,
    cardCrossAxisOffset: cardCrossAxisOffsetResult.issues,
    cardOpeningOffset: cardOpeningOffsetResult.issues,
    topStretch: topStretchResult.issues,
    rightStretch: rightStretchResult.issues,
    bottomStretch: bottomStretchResult.issues,
    leftStretch: leftStretchResult.issues,
  }
  const committedValue: PocketClusterSchema = {
    ...currentValue,
    name: nameResult.committedValue,
    color: colorResult.committedValue,
    width: widthResult.committedValue,
    height: heightResult.committedValue,
    offAxisAnchor: offAxisAnchorResult.committedValue,
    orientation: orientationResult.committedValue,
    pocketStep: pocketStepResult.committedValue,
    cardId: cardIdResult.committedValue,
    cardCrossAxisOffset: cardCrossAxisOffsetResult.committedValue,
    cardOpeningOffset: cardOpeningOffsetResult.committedValue,
    topStretch: topStretchResult.committedValue,
    rightStretch: rightStretchResult.committedValue,
    bottomStretch: bottomStretchResult.committedValue,
    leftStretch: leftStretchResult.committedValue,
    autoWidth: input.autoWidth,
    autoHeight: input.autoHeight,
    individualStretch: input.individualStretch,
  }
  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid ||
    !offAxisAnchorResult.isValid ||
    !orientationResult.isValid ||
    !pocketStepResult.isValid ||
    !cardIdResult.isValid ||
    !cardCrossAxisOffsetResult.isValid ||
    !cardOpeningOffsetResult.isValid ||
    !topStretchResult.isValid ||
    !rightStretchResult.isValid ||
    !bottomStretchResult.isValid ||
    !leftStretchResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(issues, committedValue)
}
