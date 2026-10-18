import type { EditableSchema } from '../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../schemas/issues'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateStitchLineCommonConfigSchema } from './validateStitchLineCommonConfigSchema'

type StitchLineCommonConfigOverridesSchema = Partial<StitchLineCommonConfigSchema>

export const validateStitchLineCommonConfigOverridesSchema = (
  input: EditableSchema<StitchLineCommonConfigOverridesSchema>,
  currentValue: StitchLineCommonConfigOverridesSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<StitchLineCommonConfigOverridesSchema> => {
  const resolvedEditable = {
    ...getEditableSchema(context.project.stitchingSettings, { language: context.language }),
    ...input,
  }
  const resolvedCurrentValue = {
    ...context.project.stitchingSettings,
    ...currentValue,
  }
  const resolvedResult = validateStitchLineCommonConfigSchema(resolvedEditable, resolvedCurrentValue, context)
  const issues: IssuesSchema<StitchLineCommonConfigOverridesSchema> = {
    stitchHoleDistance: getOverrideIssue(input.stitchHoleDistance, resolvedResult.issues.stitchHoleDistance),
    stitchHoleLength: getOverrideIssue(input.stitchHoleLength, resolvedResult.issues.stitchHoleLength),
    stitchHoleThickness: getOverrideIssue(input.stitchHoleThickness, resolvedResult.issues.stitchHoleThickness),
    stitchLineThickness: getOverrideIssue(input.stitchLineThickness, resolvedResult.issues.stitchLineThickness),
    stitchMargin: getOverrideIssue(input.stitchMargin, resolvedResult.issues.stitchMargin),
  }
  const committedValue: StitchLineCommonConfigOverridesSchema = {}
  const stitchHoleDistance = getCommittedOverride(
    input.stitchHoleDistance,
    currentValue.stitchHoleDistance,
    resolvedResult.committedValue.stitchHoleDistance,
    issues.stitchHoleDistance,
  )
  const stitchHoleLength = getCommittedOverride(
    input.stitchHoleLength,
    currentValue.stitchHoleLength,
    resolvedResult.committedValue.stitchHoleLength,
    issues.stitchHoleLength,
  )
  const stitchHoleThickness = getCommittedOverride(
    input.stitchHoleThickness,
    currentValue.stitchHoleThickness,
    resolvedResult.committedValue.stitchHoleThickness,
    issues.stitchHoleThickness,
  )
  const stitchLineThickness = getCommittedOverride(
    input.stitchLineThickness,
    currentValue.stitchLineThickness,
    resolvedResult.committedValue.stitchLineThickness,
    issues.stitchLineThickness,
  )
  const stitchMargin = getCommittedOverride(
    input.stitchMargin,
    currentValue.stitchMargin,
    resolvedResult.committedValue.stitchMargin,
    issues.stitchMargin,
  )
  if (isDefined(stitchHoleDistance)) {
    committedValue.stitchHoleDistance = stitchHoleDistance
  }
  if (isDefined(stitchHoleLength)) {
    committedValue.stitchHoleLength = stitchHoleLength
  }
  if (isDefined(stitchHoleThickness)) {
    committedValue.stitchHoleThickness = stitchHoleThickness
  }
  if (isDefined(stitchLineThickness)) {
    committedValue.stitchLineThickness = stitchLineThickness
  }
  if (isDefined(stitchMargin)) {
    committedValue.stitchMargin = stitchMargin
  }
  const hasValidationError =
    isDefined(issues.stitchMargin) ||
    isDefined(issues.stitchHoleLength) ||
    isDefined(issues.stitchHoleDistance) ||
    isDefined(issues.stitchHoleThickness) ||
    isDefined(issues.stitchLineThickness)

  if (hasValidationError) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}

const getOverrideIssue = (editableValue: unknown, issue: IssueSchema | undefined): IssueSchema | undefined => {
  if (!isDefined(editableValue)) {
    return undefined
  }

  return issue
}

const getCommittedOverride = <TEditable, T>(
  editableValue: TEditable | undefined,
  currentValue: T | undefined,
  resolvedCommittedValue: T,
  issue: IssueSchema | undefined,
): T | undefined => {
  if (!isDefined(editableValue)) {
    return undefined
  }

  if (isDefined(issue)) {
    return currentValue
  }

  return resolvedCommittedValue
}
