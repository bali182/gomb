import { defaultRecessedPocketOpening, defaultSlantedPocketOpening } from '../defaultStates'
import type {
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketOpeningSchema = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => validatePocketOpeningByType(input, currentValue, context)

const validatePocketOpeningByType = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => {
  const typeResult = validatePrimitiveUnion(
    input.type,
    currentValue.type,
    { straight: true, recessed: true, slanted: true },
    context,
  )

  if (!typeResult.isValid) {
    return createInvalidValidationResult<PocketOpeningSchema>({ type: typeResult.issues }, currentValue)
  }

  switch (input.type) {
    case 'straight':
      return createValidValidationResult<PocketOpeningSchema>({ type: undefined }, { type: 'straight' })
    case 'recessed':
      return validateRecessedPocketOpeningSchema(
        input,
        currentValue.type === 'recessed' ? currentValue : defaultRecessedPocketOpening,
        context,
      )
    case 'slanted':
      return validateSlantedPocketOpeningSchema(
        input,
        currentValue.type === 'slanted' ? currentValue : defaultSlantedPocketOpening,
        context,
      )
  }
}

const validateSlantedPocketOpeningSchema = (
  input: EditableSchema<SlantedPocketOpeningSchema>,
  currentValue: SlantedPocketOpeningSchema,
  context: BaseValidationContextSchema,
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
  context: BaseValidationContextSchema,
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
