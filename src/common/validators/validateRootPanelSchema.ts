import type { LayoutOrientationSchema, RootPanelSchema } from '../schemas/components'
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

export const validateRootPanelSchema = (
  input: EditableSchema<RootPanelSchema>,
  currentValue: RootPanelSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<RootPanelSchema> => {
  const otherRootPanels = context.project.subProjects
    .filter((subProject) => subProject.id !== context.subProject.id)
    .map((subProject) => subProject.components[subProject.root])
    .filter((component): component is RootPanelSchema => isDefined(component) && component.type === 'root-panel')
  const nameResult = validateName(
    input.name,
    currentValue.name,
    input.id,
    [...Object.values(context.subProject.components), ...otherRootPanels],
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

  const issues: IssuesSchema<RootPanelSchema> = {
    bottomLeftRadius: bottomLeftRadiusResult.issues,
    bottomRightRadius: bottomRightRadiusResult.issues,
    children: input.children.map(() => undefined),
    color: colorResult.issues,
    height: heightResult.issues,
    id: undefined,
    individualRadii: undefined,
    layoutGap: layoutGapResult.issues,
    layoutOrientation: layoutOrientationResult.issues,
    name: nameResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    type: undefined,
    width: widthResult.issues,
    autoLayoutGap: undefined,
  }

  const committedValue: RootPanelSchema = {
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    children: currentValue.children,
    height: heightResult.committedValue,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    layoutGap: layoutGapResult.committedValue,
    layoutOrientation: layoutOrientationResult.committedValue,
    name: nameResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    type: currentValue.type,
    width: widthResult.committedValue,
    autoLayoutGap: input.autoLayoutGap,
  }

  if (isDefined(colorResult.committedValue)) {
    committedValue.color = colorResult.committedValue
  }

  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !layoutOrientationResult.isValid ||
    !layoutGapResult.isValid ||
    !topLeftRadiusResult.isValid ||
    !topRightRadiusResult.isValid ||
    !bottomLeftRadiusResult.isValid ||
    !bottomRightRadiusResult.isValid ||
    !widthResult.isValid ||
    !heightResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  const value: RootPanelSchema = {
    bottomLeftRadius: bottomLeftRadiusResult.value,
    bottomRightRadius: bottomRightRadiusResult.value,
    children: currentValue.children,
    height: heightResult.value,
    id: currentValue.id,
    individualRadii: input.individualRadii,
    layoutGap: layoutGapResult.value,
    layoutOrientation: layoutOrientationResult.value,
    name: nameResult.value,
    topLeftRadius: topLeftRadiusResult.value,
    topRightRadius: topRightRadiusResult.value,
    type: currentValue.type,
    width: widthResult.value,
    autoLayoutGap: input.autoLayoutGap,
  }

  if (isDefined(colorResult.value)) {
    value.color = colorResult.value
  }

  return createValidValidationResult(issues, value, committedValue)
}
