import { defaultPocketCluster } from '../defaultStates'
import { getUnusedName } from '../operations/subProject/utils/getUnusedName'
import type { AnchorSchema } from '../schemas/common'
import type {
  LayoutOrientationSchema,
  PocketClusterSchema,
  PocketOpeningSchema,
  PocketOrientationSchema,
} from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import type { CardSchemaId } from '../schemas/valuables'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePocketOpeningSchema } from './validatePocketOpeningSchema'
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
  const openings = [input.defaultOpening, ...input.openings]
  const currentOpeningAccessor = accessors.pocketCluster(currentValue)
  const defaultOpeningResult = validatePocketOpeningSchema(
    input.defaultOpening,
    currentValue.defaultOpening,
    openings,
    context,
  )
  const openingResults = input.openings.map((opening) => {
    const previous = currentOpeningAccessor.optional.opening(opening.id)
    const fallback: PocketOpeningSchema = {
      ...defaultPocketCluster.defaultOpening,
      id: opening.id,
      name: getUnusedName(currentValue.defaultOpening.name, new Set(openings.map((opening) => opening.name))),
    }
    return validatePocketOpeningSchema(opening, previous ?? fallback, openings, context)
  })
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
  const widthResult = validateNumber(input.width, currentValue.width, context, { min: 0 })
  const heightResult = validateNumber(input.height, currentValue.height, context, { min: 0 })
  const orientationResult = validatePrimitiveUnion(
    input.orientation,
    currentValue.orientation,
    pocketOrientationValues,
    context,
  )
  const cardCrossAxisOffsetResult = validateNumber(input.cardCrossAxisOffset, currentValue.cardCrossAxisOffset, context)
  const cardOpeningOffsetResult = validateNumber(input.cardOpeningOffset, currentValue.cardOpeningOffset, context, {
    min: 0,
  })
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
  const topStretchResult = validateNumber(input.topStretch, currentValue.topStretch, context)
  const rightStretchResult = validateNumber(input.rightStretch, currentValue.rightStretch, context)
  const bottomStretchResult = validateNumber(input.bottomStretch, currentValue.bottomStretch, context)
  const leftStretchResult = validateNumber(input.leftStretch, currentValue.leftStretch, context)

  const issues: IssuesSchema<PocketClusterSchema> = {
    defaultOpening: defaultOpeningResult.issues,
    openings: openingResults.map((result) => result.issues),
    openingMapping: Object.fromEntries(Object.keys(input.openingMapping).map((key) => [key, undefined])),
    autoHeight: undefined,
    autoWidth: undefined,
    offAxisAnchor: offAxisAnchorResult.issues,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    children: input.children.map(() => undefined),
    cardId: cardIdResult.issues,
    cardCrossAxisOffset: cardCrossAxisOffsetResult.issues,
    cardOpeningOffset: cardOpeningOffsetResult.issues,
    color: colorResult.issues,
    height: heightResult.issues,
    id: undefined,
    individualRadii: undefined,
    individualStretch: undefined,
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
    topStretch: topStretchResult.issues,
    rightStretch: rightStretchResult.issues,
    bottomStretch: bottomStretchResult.issues,
    leftStretch: leftStretchResult.issues,
  }

  const committedValue: PocketClusterSchema = {
    defaultOpening: defaultOpeningResult.committedValue,
    openings: openingResults.map((result) => result.committedValue),
    openingMapping: input.openingMapping,
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    children: currentValue.children,
    cardId: cardIdResult.committedValue,
    cardCrossAxisOffset: cardCrossAxisOffsetResult.committedValue,
    cardOpeningOffset: cardOpeningOffsetResult.committedValue,
    height: heightResult.committedValue,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualStretch: input.individualStretch,
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
    topStretch: topStretchResult.committedValue,
    rightStretch: rightStretchResult.committedValue,
    bottomStretch: bottomStretchResult.committedValue,
    leftStretch: leftStretchResult.committedValue,
  }

  if (isDefined(colorResult.committedValue)) {
    committedValue.color = colorResult.committedValue
  }

  if (
    !defaultOpeningResult.isValid ||
    openingResults.some((result) => !result.isValid) ||
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
    !cardCrossAxisOffsetResult.isValid ||
    !cardOpeningOffsetResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid ||
    !orientationResult.isValid ||
    !pocketCountResult.isValid ||
    !pocketStepResult.isValid ||
    !tPocketTabWidthResult.isValid ||
    !tPocketTaperResult.isValid ||
    !topStretchResult.isValid ||
    !rightStretchResult.isValid ||
    !bottomStretchResult.isValid ||
    !leftStretchResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  const value: PocketClusterSchema = {
    defaultOpening: defaultOpeningResult.value,
    openings: openingResults.map((result) => result.committedValue),
    openingMapping: input.openingMapping,
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.value,
    bottomRightRadius: bottomRightRadiusResult.value,
    children: currentValue.children,
    cardId: cardIdResult.value,
    cardCrossAxisOffset: cardCrossAxisOffsetResult.value,
    cardOpeningOffset: cardOpeningOffsetResult.value,
    height: heightResult.value,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualStretch: input.individualStretch,
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
    topStretch: topStretchResult.value,
    rightStretch: rightStretchResult.value,
    bottomStretch: bottomStretchResult.value,
    leftStretch: leftStretchResult.value,
  }

  if (isDefined(colorResult.value)) {
    value.color = colorResult.value
  }

  return createValidValidationResult(issues, value, committedValue)
}
