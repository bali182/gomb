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
  const offset = validateNumber(input.offset, currentValue.offset, context, { min: 0, minInclusive: false })
  const side = validatePrimitiveUnion(input.side, currentValue.side, { start: true, end: true }, context)
  const issues: IssuesSchema<SlantedPocketOpeningSchema> = { offset: offset.issues, side: side.issues }
  const committedValue: SlantedPocketOpeningSchema = {
    ...currentValue,
    offset: offset.committedValue,
    side: side.committedValue,
  }
  if (!offset.isValid || !side.isValid) {
    return createInvalidValidationResult<SlantedPocketOpeningSchema>(issues, committedValue)
  }
  return createValidValidationResult<SlantedPocketOpeningSchema>(
    issues,
    { ...currentValue, offset: offset.value, side: side.value },
    committedValue,
  )
}

const validateRecessedPocketOpeningSchema = (
  input: EditableSchema<RecessedPocketOpeningSchema>,
  currentValue: RecessedPocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<RecessedPocketOpeningSchema> => {
  const outerInset = validateNumber(input.outerInset, currentValue.outerInset, context, { min: 0 })
  const innerOffset = validateNumber(input.innerOffset, currentValue.innerOffset, context, { min: 0 })
  const depth = validateNumber(input.depth, currentValue.depth, context, { min: 0 })
  const outerRadius = validateNumber(input.outerRadius, currentValue.outerRadius, context, { min: 0 })
  const innerRadius = validateNumber(input.innerRadius, currentValue.innerRadius, context, { min: 0 })
  const issues: IssuesSchema<RecessedPocketOpeningSchema> = {
    type: undefined,
    outerInset: outerInset.issues,
    innerOffset: innerOffset.issues,
    depth: depth.issues,
    outerRadius: outerRadius.issues,
    innerRadius: innerRadius.issues,
  }
  const committedValue: RecessedPocketOpeningSchema = {
    ...currentValue,
    type: 'recessed',
    outerInset: outerInset.committedValue,
    innerOffset: innerOffset.committedValue,
    depth: depth.committedValue,
    outerRadius: outerRadius.committedValue,
    innerRadius: innerRadius.committedValue,
  }

  if (!outerInset.isValid || !innerOffset.isValid || !depth.isValid || !outerRadius.isValid || !innerRadius.isValid) {
    return createInvalidValidationResult<RecessedPocketOpeningSchema>(issues, committedValue)
  }

  return createValidValidationResult<RecessedPocketOpeningSchema>(
    issues,
    {
      ...currentValue,
      type: 'recessed',
      outerInset: outerInset.value,
      innerOffset: innerOffset.value,
      depth: depth.value,
      outerRadius: outerRadius.value,
      innerRadius: innerRadius.value,
    },
    committedValue,
  )
}

const validateOpticalIllusionPocketOpeningSchema = (
  input: EditableSchema<OpticalIllusionPocketOpeningSchema>,
  currentValue: OpticalIllusionPocketOpeningSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<OpticalIllusionPocketOpeningSchema> => {
  const direction = validatePrimitiveUnion(input.direction, currentValue.direction, { start: true, end: true }, context)
  const startInset = validateNumber(input.startInset, currentValue.startInset, context, { min: 0 })
  const endInset = validateNumber(input.endInset, currentValue.endInset, context, { min: 0 })
  const leadingRadius = validateNumber(input.leadingRadius, currentValue.leadingRadius, context, { min: 0 })
  const trailingRadius = validateNumber(input.trailingRadius, currentValue.trailingRadius, context, { min: 0 })
  const issues: IssuesSchema<OpticalIllusionPocketOpeningSchema> = {
    type: undefined,
    direction: direction.issues,
    startInset: startInset.issues,
    endInset: endInset.issues,
    leadingRadius: leadingRadius.issues,
    trailingRadius: trailingRadius.issues,
  }
  const committedValue: OpticalIllusionPocketOpeningSchema = {
    ...currentValue,
    direction: direction.committedValue,
    startInset: startInset.committedValue,
    endInset: endInset.committedValue,
    leadingRadius: leadingRadius.committedValue,
    trailingRadius: trailingRadius.committedValue,
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
      direction: direction.value,
      startInset: startInset.value,
      endInset: endInset.value,
      leadingRadius: leadingRadius.value,
      trailingRadius: trailingRadius.value,
    },
    committedValue,
  )
}
