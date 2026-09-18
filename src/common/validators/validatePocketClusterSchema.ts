import type { AnchorSchema } from '../schemas/common'
import type { LayoutOrientationSchema, PocketClusterSchema, PocketOrientationSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type {
  ComponentBasedValidationContextSchema,
  ValidationIssuesSchema,
  ValidationResultSchema,
} from '../schemas/validation'
import type { CardSchemaId } from '../schemas/valuables'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

const pocketOrientationValues: Record<PocketOrientationSchema, boolean> = {
  down: true,
  left: true,
  right: true,
  up: true,
}

const layoutOrientationValues: Record<LayoutOrientationSchema, boolean> = {
  horizontal: true,
  vertical: true,
}

const cardIdValues: Record<CardSchemaId, boolean> = {
  'ID-1-landscape': true,
  'ID-2-landscape': true,
  'ID-3-landscape': true,
  'ID-1-portrait': true,
  'ID-2-portrait': true,
  'ID-3-portrait': true,
}

const anchorValues: Record<AnchorSchema, boolean> = { start: true, middle: true, end: true }

export const validatePocketClusterSchema = (
  input: EditableSchema<PocketClusterSchema>,
  currentValue: PocketClusterSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PocketClusterSchema> => {
  const nameResult = validateName(
    input.name,
    currentValue.name,
    input.id,
    Object.values(context.subProject.components),
    context,
  )
  const colorResult = validateOptionalHexColor(input.color, currentValue.color, context)
  const layoutOrientationResult = validatePrimitiveUnion(
    input.layoutOrientation,
    currentValue.layoutOrientation,
    layoutOrientationValues,
    context,
  )
  const layoutGapResult = validateNumber(input.layoutGap, currentValue.layoutGap, context, { min: 0 })
  const offAxisAnchorResult = validatePrimitiveUnion(
    input.offAxisAnchor,
    currentValue.offAxisAnchor,
    anchorValues,
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
  const widthResult = validateNumber(input.width, currentValue.width, context, { min: 0, minInclusive: false })
  const heightResult = validateNumber(input.height, currentValue.height, context, { min: 0, minInclusive: false })
  const orientationResult = validatePrimitiveUnion(
    input.orientation,
    currentValue.orientation,
    pocketOrientationValues,
    context,
  )
  const cardIdResult = validatePrimitiveUnion(input.cardId, currentValue.cardId, cardIdValues, context, true)
  const pocketCountResult = validateNumber(input.pocketCount, currentValue.pocketCount, context, {
    allowFraction: false,
    min: 1,
  })
  const pocketStepResult = validateNumber(input.pocketStep, currentValue.pocketStep, context, {
    min: 0,
    minInclusive: false,
  })
  const tPocketTabWidthResult = validateNumber(input.tPocketTabWidth, currentValue.tPocketTabWidth, context, {
    min: 0,
    minInclusive: false,
  })
  const tPocketTaperResult = validateNumber(input.tPocketTaper, currentValue.tPocketTaper, context, {
    min: 0,
    minInclusive: false,
  })
  const topSqueezeResult = validateNumber(input.topSqueeze, currentValue.topSqueeze, context)
  const rightSqueezeResult = validateNumber(input.rightSqueeze, currentValue.rightSqueeze, context)
  const bottomSqueezeResult = validateNumber(input.bottomSqueeze, currentValue.bottomSqueeze, context)
  const leftSqueezeResult = validateNumber(input.leftSqueeze, currentValue.leftSqueeze, context)

  const issues: ValidationIssuesSchema<PocketClusterSchema> = {
    autoHeight: undefined,
    autoWidth: undefined,
    offAxisAnchor: offAxisAnchorResult.issues,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    children: input.children.map(() => undefined),
    cardId: cardIdResult.issues,
    color: colorResult.issues,
    height: heightResult.issues,
    id: undefined,
    individualRadii: undefined,
    individualSqueeze: undefined,
    layoutGap: layoutGapResult.issues,
    layoutOrientation: layoutOrientationResult.issues,
    name: nameResult.issues,
    orientation: orientationResult.issues,
    pocketCount: pocketCountResult.issues,
    pocketStep: pocketStepResult.issues,
    tPocketTabWidth: tPocketTabWidthResult.issues,
    tPocketTaper: tPocketTaperResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    type: undefined,
    width: widthResult.issues,
    autoLayoutGap: undefined,
    topSqueeze: topSqueezeResult.issues,
    rightSqueeze: rightSqueezeResult.issues,
    bottomSqueeze: bottomSqueezeResult.issues,
    leftSqueeze: leftSqueezeResult.issues,
  }

  const committedValue: PocketClusterSchema = {
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    children: currentValue.children,
    cardId: cardIdResult.committedValue,
    height: heightResult.committedValue,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualSqueeze: input.individualSqueeze,
    layoutGap: layoutGapResult.committedValue,
    layoutOrientation: layoutOrientationResult.committedValue,
    name: nameResult.committedValue,
    orientation: orientationResult.committedValue,
    offAxisAnchor: offAxisAnchorResult.committedValue,
    pocketCount: pocketCountResult.committedValue,
    pocketStep: pocketStepResult.committedValue,
    tPocketTabWidth: tPocketTabWidthResult.committedValue,
    tPocketTaper: tPocketTaperResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    type: currentValue.type,
    width: widthResult.committedValue,
    autoLayoutGap: input.autoLayoutGap,
    topSqueeze: topSqueezeResult.committedValue,
    rightSqueeze: rightSqueezeResult.committedValue,
    bottomSqueeze: bottomSqueezeResult.committedValue,
    leftSqueeze: leftSqueezeResult.committedValue,
  }

  if (isDefined(colorResult.committedValue)) {
    committedValue.color = colorResult.committedValue
  }

  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !layoutOrientationResult.isValid ||
    !layoutGapResult.isValid ||
    !offAxisAnchorResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid ||
    !cardIdResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid ||
    !orientationResult.isValid ||
    !pocketCountResult.isValid ||
    !pocketStepResult.isValid ||
    !tPocketTabWidthResult.isValid ||
    !tPocketTaperResult.isValid ||
    !topSqueezeResult.isValid ||
    !rightSqueezeResult.isValid ||
    !bottomSqueezeResult.isValid ||
    !leftSqueezeResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  const value: PocketClusterSchema = {
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.value,
    bottomRightRadius: bottomRightRadiusResult.value,
    children: currentValue.children,
    cardId: cardIdResult.value,
    height: heightResult.value,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualSqueeze: input.individualSqueeze,
    layoutGap: layoutGapResult.value,
    layoutOrientation: layoutOrientationResult.value,
    name: nameResult.value,
    orientation: orientationResult.value,
    offAxisAnchor: offAxisAnchorResult.value,
    pocketCount: pocketCountResult.value,
    pocketStep: pocketStepResult.value,
    tPocketTabWidth: tPocketTabWidthResult.value,
    tPocketTaper: tPocketTaperResult.value,
    topLeftRadius: topLeftRadiusResult.value,
    topRightRadius: topRightRadiusResult.value,
    type: currentValue.type,
    width: widthResult.value,
    autoLayoutGap: input.autoLayoutGap,
    topSqueeze: topSqueezeResult.value,
    rightSqueeze: rightSqueezeResult.value,
    bottomSqueeze: bottomSqueezeResult.value,
    leftSqueeze: leftSqueezeResult.value,
  }

  if (isDefined(colorResult.value)) {
    value.color = colorResult.value
  }

  return createValidValidationResult(issues, value, committedValue)
}
