import type { AnchorSchema } from '../schemas/common'
import type { LayoutOrientationSchema, PanelSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

const layoutOrientationValues: Record<LayoutOrientationSchema, boolean> = {
  horizontal: true,
  vertical: true,
}

const anchorValues: Record<AnchorSchema, boolean> = { start: true, middle: true, end: true }

export const validatePanelSchema = (
  input: EditableSchema<PanelSchema>,
  currentValue: PanelSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PanelSchema> => {
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
  const mainAxisAnchorResult = validatePrimitiveUnion(
    input.mainAxisAnchor,
    currentValue.mainAxisAnchor,
    { start: true, middle: true, end: true },
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

  const topStretchResult = validateNumber(input.topStretch, currentValue.topStretch, context)
  const rightStretchResult = validateNumber(input.rightStretch, currentValue.rightStretch, context)
  const bottomStretchResult = validateNumber(input.bottomStretch, currentValue.bottomStretch, context)
  const leftStretchResult = validateNumber(input.leftStretch, currentValue.leftStretch, context)

  const issues: IssuesSchema<PanelSchema> = {
    autoHeight: undefined,
    autoWidth: undefined,
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    children: input.children.map(() => undefined),
    color: colorResult.issues,
    height: heightResult.issues,
    id: undefined,
    individualRadii: undefined,
    individualStretch: undefined,
    layoutGap: layoutGapResult.issues,
    layoutOrientation: layoutOrientationResult.issues,
    mainAxisAnchor: mainAxisAnchorResult.issues,
    name: nameResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    type: undefined,
    width: widthResult.issues,
    autoLayoutGap: undefined,
    offAxisAnchor: offAxisAnchorResult.issues,
    topStretch: topStretchResult.issues,
    rightStretch: rightStretchResult.issues,
    bottomStretch: bottomStretchResult.issues,
    leftStretch: leftStretchResult.issues,
  }

  const committedValue: PanelSchema = {
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    children: currentValue.children,
    height: heightResult.committedValue,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualStretch: input.individualStretch,
    layoutGap: layoutGapResult.committedValue,
    layoutOrientation: layoutOrientationResult.committedValue,
    mainAxisAnchor: mainAxisAnchorResult.committedValue,
    name: nameResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    type: currentValue.type,
    width: widthResult.committedValue,
    autoLayoutGap: input.autoLayoutGap,
    offAxisAnchor: offAxisAnchorResult.committedValue,
    topStretch: topStretchResult.committedValue,
    rightStretch: rightStretchResult.committedValue,
    bottomStretch: bottomStretchResult.committedValue,
    leftStretch: leftStretchResult.committedValue,
  }

  if (isDefined(colorResult.committedValue)) {
    committedValue.color = colorResult.committedValue
  }

  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !layoutOrientationResult.isValid ||
    !mainAxisAnchorResult.isValid ||
    !layoutGapResult.isValid ||
    !offAxisAnchorResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid ||
    !topStretchResult.isValid ||
    !rightStretchResult.isValid ||
    !bottomStretchResult.isValid ||
    !leftStretchResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  const value: PanelSchema = {
    autoHeight: input.autoHeight,
    autoWidth: input.autoWidth,
    bottomLeftRadius: bottomLeftRadiusResult.value,
    bottomRightRadius: bottomRightRadiusResult.value,
    children: currentValue.children,
    height: heightResult.value,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    individualStretch: input.individualStretch,
    layoutGap: layoutGapResult.value,
    layoutOrientation: layoutOrientationResult.value,
    mainAxisAnchor: mainAxisAnchorResult.value,
    name: nameResult.value,
    topLeftRadius: topLeftRadiusResult.value,
    topRightRadius: topRightRadiusResult.value,
    type: currentValue.type,
    width: widthResult.value,
    autoLayoutGap: input.autoLayoutGap,
    offAxisAnchor: offAxisAnchorResult.value,
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
