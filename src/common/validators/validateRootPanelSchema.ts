import type { RootPanelSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'

export const validateRootPanelSchema = (
  input: EditableSchema<RootPanelSchema>,
  currentValue: RootPanelSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<RootPanelSchema> => {
  const otherRootPanels = context.project.subProjects
    .filter((subProject) => subProject.id !== context.subProject.id)
    .map((subProject) => accessors.subProject(subProject).optional.component.rootPanel())
    .filter(isDefined)
  const nameResult = validateName(
    input.name,
    currentValue.name,
    input.id,
    [...accessors.subProject(context.subProject).component.components(), ...otherRootPanels],
    context,
  )
  const colorResult = validateOptionalHexColor(input.color, currentValue.color, context)
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
    color: colorResult.issues,
    height: heightResult.issues,
    id: undefined,
    name: nameResult.issues,
    topLeftRadius: topLeftRadiusResult.issues,
    topRightRadius: topRightRadiusResult.issues,
    type: undefined,
    frontFaceId: undefined,
    backFaceId: undefined,
    width: widthResult.issues,
  }

  const committedValue: RootPanelSchema = {
    bottomLeftRadius: bottomLeftRadiusResult.committedValue,
    bottomRightRadius: bottomRightRadiusResult.committedValue,
    height: heightResult.committedValue,
    id: currentValue.id,
    name: nameResult.committedValue,
    topLeftRadius: topLeftRadiusResult.committedValue,
    topRightRadius: topRightRadiusResult.committedValue,
    type: currentValue.type,
    frontFaceId: currentValue.frontFaceId,
    backFaceId: currentValue.backFaceId,
    width: widthResult.committedValue,
  }

  if (isDefined(colorResult.committedValue)) {
    committedValue.color = colorResult.committedValue
  }

  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
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
    height: heightResult.value,
    id: currentValue.id,
    name: nameResult.value,
    topLeftRadius: topLeftRadiusResult.value,
    topRightRadius: topRightRadiusResult.value,
    type: currentValue.type,
    frontFaceId: currentValue.frontFaceId,
    backFaceId: currentValue.backFaceId,
    width: widthResult.value,
  }

  if (isDefined(colorResult.value)) {
    value.color = colorResult.value
  }

  return createValidValidationResult(issues, value, committedValue)
}
