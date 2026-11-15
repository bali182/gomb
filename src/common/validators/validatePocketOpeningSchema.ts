import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../schemas/pocketOpening'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { narrowers } from '../utils/narrowers'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketOpeningSchema = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => {
  if (input.type !== currentValue.type) {
    return createInvalidValidationResult<PocketOpeningSchema>(
      { type: { severity: 'error', message: context.t.primitive.invalid } },
      currentValue,
    )
  }
  const name = validateName(
    input.name,
    currentValue.name,
    currentValue.id,
    Object.values(context.subProject.pocketOpenings),
    context,
  )
  const result = validatePocketOpeningByType(input, currentValue, context)
  const issues: IssuesSchema<PocketOpeningSchema> = { ...result.issues, name: name.issues }
  const committedValue: PocketOpeningSchema = { ...result.committedValue, name: name.committedValue }
  if (!name.isValid || !result.isValid) {
    return createInvalidValidationResult<PocketOpeningSchema>(issues, committedValue)
  }
  return createValidValidationResult<PocketOpeningSchema>(issues, { ...result.value, name: name.value }, committedValue)
}

const validatePocketOpeningByType = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => {
  const typeResult = validatePrimitiveUnion(
    input.type,
    currentValue.type,
    { straight: true, recessed: true, slanted: true, 'optical-illusion': true },
    context,
  )

  if (!typeResult.isValid) {
    return createInvalidValidationResult<PocketOpeningSchema>({ type: typeResult.issues }, currentValue)
  }

  switch (input.type) {
    case 'optical-illusion':
      if (!narrowers.is.opticalIllusionPocketOpening(currentValue)) {
        return createInvalidValidationResult<PocketOpeningSchema>(
          { type: { severity: 'error', message: context.t.primitive.invalid } },
          currentValue,
        )
      }
      return validateOpticalIllusionPocketOpeningSchema(input, currentValue, context)

    case 'straight':
      return createValidValidationResult<PocketOpeningSchema>({ type: undefined }, currentValue)
    case 'recessed':
      if (!narrowers.is.recessedPocketOpening(currentValue)) {
        return createInvalidValidationResult<PocketOpeningSchema>(
          { type: { severity: 'error', message: context.t.primitive.invalid } },
          currentValue,
        )
      }
      return validateRecessedPocketOpeningSchema(input, currentValue, context)
    case 'slanted':
      if (!narrowers.is.slantedPocketOpening(currentValue)) {
        return createInvalidValidationResult<PocketOpeningSchema>(
          { type: { severity: 'error', message: context.t.primitive.invalid } },
          currentValue,
        )
      }
      return validateSlantedPocketOpeningSchema(input, currentValue, context)
  }
}

const validateSlantedPocketOpeningSchema = (
  input: EditableSchema<SlantedPocketOpeningSchema>,
  currentValue: SlantedPocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<SlantedPocketOpeningSchema> => {
  const offset = validateNumber(input.slantOffset, currentValue.slantOffset, context, { min: 0, minInclusive: false })
  const side = validatePrimitiveUnion(input.slantSide, currentValue.slantSide, { start: true, end: true }, context)
  const issues: IssuesSchema<SlantedPocketOpeningSchema> = { slantOffset: offset.issues, slantSide: side.issues }
  const committedValue: SlantedPocketOpeningSchema = {
    ...currentValue,
    slantOffset: offset.committedValue,
    slantSide: side.committedValue,
  }
  if (!offset.isValid || !side.isValid) {
    return createInvalidValidationResult<SlantedPocketOpeningSchema>(issues, committedValue)
  }
  return createValidValidationResult<SlantedPocketOpeningSchema>(
    issues,
    { ...currentValue, slantOffset: offset.value, slantSide: side.value },
    committedValue,
  )
}

const validateRecessedPocketOpeningSchema = (
  input: EditableSchema<RecessedPocketOpeningSchema>,
  currentValue: RecessedPocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<RecessedPocketOpeningSchema> => {
  const outerInset = validateNumber(input.recessOuterInset, currentValue.recessOuterInset, context, { min: 0 })
  const innerOffset = validateNumber(input.recessInnerOffset, currentValue.recessInnerOffset, context, { min: 0 })
  const depth = validateNumber(input.recessDepth, currentValue.recessDepth, context, { min: 0 })
  const outerRadius = validateNumber(input.recessOuterRadius, currentValue.recessOuterRadius, context, { min: 0 })
  const innerRadius = validateNumber(input.recessInnerRadius, currentValue.recessInnerRadius, context, { min: 0 })
  const issues: IssuesSchema<RecessedPocketOpeningSchema> = {
    type: undefined,
    recessOuterInset: outerInset.issues,
    recessInnerOffset: innerOffset.issues,
    recessDepth: depth.issues,
    recessOuterRadius: outerRadius.issues,
    recessInnerRadius: innerRadius.issues,
  }
  const committedValue: RecessedPocketOpeningSchema = {
    ...currentValue,
    type: 'recessed',
    recessOuterInset: outerInset.committedValue,
    recessInnerOffset: innerOffset.committedValue,
    recessDepth: depth.committedValue,
    recessOuterRadius: outerRadius.committedValue,
    recessInnerRadius: innerRadius.committedValue,
  }

  if (!outerInset.isValid || !innerOffset.isValid || !depth.isValid || !outerRadius.isValid || !innerRadius.isValid) {
    return createInvalidValidationResult<RecessedPocketOpeningSchema>(issues, committedValue)
  }

  return createValidValidationResult<RecessedPocketOpeningSchema>(
    issues,
    {
      ...currentValue,
      type: 'recessed',
      recessOuterInset: outerInset.value,
      recessInnerOffset: innerOffset.value,
      recessDepth: depth.value,
      recessOuterRadius: outerRadius.value,
      recessInnerRadius: innerRadius.value,
    },
    committedValue,
  )
}

const validateOpticalIllusionPocketOpeningSchema = (
  input: EditableSchema<OpticalIllusionPocketOpeningSchema>,
  currentValue: OpticalIllusionPocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<OpticalIllusionPocketOpeningSchema> => {
  const direction = validatePrimitiveUnion(
    input.illusionSide,
    currentValue.illusionSide,
    { start: true, end: true },
    context,
  )
  const startInset = validateNumber(input.illusionStartInset, currentValue.illusionStartInset, context, { min: 0 })
  const endInset = validateNumber(input.illusionEndInset, currentValue.illusionEndInset, context, { min: 0 })
  const leadingRadius = validateNumber(input.illusionLeadingRadius, currentValue.illusionLeadingRadius, context, {
    min: 0,
  })
  const trailingRadius = validateNumber(input.illusionTrailingRadius, currentValue.illusionTrailingRadius, context, {
    min: 0,
  })
  const issues: IssuesSchema<OpticalIllusionPocketOpeningSchema> = {
    type: undefined,
    illusionSide: direction.issues,
    illusionStartInset: startInset.issues,
    illusionEndInset: endInset.issues,
    illusionLeadingRadius: leadingRadius.issues,
    illusionTrailingRadius: trailingRadius.issues,
  }
  const committedValue: OpticalIllusionPocketOpeningSchema = {
    ...currentValue,
    illusionSide: direction.committedValue,
    illusionStartInset: startInset.committedValue,
    illusionEndInset: endInset.committedValue,
    illusionLeadingRadius: leadingRadius.committedValue,
    illusionTrailingRadius: trailingRadius.committedValue,
  }
  if (
    !direction.isValid ||
    !startInset.isValid ||
    !endInset.isValid ||
    !leadingRadius.isValid ||
    !trailingRadius.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(
    issues,
    {
      ...currentValue,
      illusionSide: direction.value,
      illusionStartInset: startInset.value,
      illusionEndInset: endInset.value,
      illusionLeadingRadius: leadingRadius.value,
      illusionTrailingRadius: trailingRadius.value,
    },
    committedValue,
  )
}
