import { defaultRecessedPocketTop } from '../defaultStates'
import type { HasIdentitySchema } from '../schemas/common'
import type { PocketOpeningOwnSchema, PocketOpeningSchema, RecessedPocketOpeningSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { BaseValidationContextSchema, ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketTopSchema = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  pocketTops: readonly HasIdentitySchema[],
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => {
  const ownResult = validatePocketTopOwnSchema(input, currentValue, context)
  const nameResult = validateName(input.name, currentValue.name, currentValue.id, pocketTops, context)
  const issues: ValidationIssuesSchema<PocketOpeningSchema> = {
    ...ownResult.issues,
    id: undefined,
    name: nameResult.issues,
  }
  const committedValue: PocketOpeningSchema = {
    ...ownResult.committedValue,
    id: currentValue.id,
    name: nameResult.committedValue,
  }

  if (!ownResult.isValid || !nameResult.isValid) {
    return createInvalidValidationResult<PocketOpeningSchema>(issues, committedValue)
  }

  return createValidValidationResult<PocketOpeningSchema>(
    issues,
    { ...ownResult.value, id: currentValue.id, name: nameResult.value },
    committedValue,
  )
}

const validatePocketTopOwnSchema = (
  input: EditableSchema<PocketOpeningOwnSchema>,
  currentValue: PocketOpeningOwnSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketOpeningOwnSchema> => {
  const typeResult = validatePrimitiveUnion(input.type, currentValue.type, { straight: true, recessed: true }, context)

  if (!typeResult.isValid) {
    return createInvalidValidationResult<PocketOpeningOwnSchema>({ type: typeResult.issues }, currentValue)
  }

  switch (input.type) {
    case 'straight':
      return createValidValidationResult<PocketOpeningOwnSchema>({ type: undefined }, { type: 'straight' })
    case 'recessed':
      return validateRecessedPocketTopSchema(
        input,
        currentValue.type === 'recessed' ? currentValue : defaultRecessedPocketTop,
        context,
      )
  }
}

const validateRecessedPocketTopSchema = (
  input: EditableSchema<RecessedPocketOpeningSchema>,
  currentValue: RecessedPocketOpeningSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<RecessedPocketOpeningSchema> => {
  const outerInset = validateNumber(input.outerInset, currentValue.outerInset, context, { min: 0 })
  const innerInset = validateNumber(input.innerInset, currentValue.innerInset, context, { min: 0 })
  const depth = validateNumber(input.depth, currentValue.depth, context, { min: 0 })
  const outerRadius = validateNumber(input.outerRadius, currentValue.outerRadius, context, { min: 0 })
  const innerRadius = validateNumber(input.innerRadius, currentValue.innerRadius, context, { min: 0 })
  const issues: ValidationIssuesSchema<RecessedPocketOpeningSchema> = {
    type: undefined,
    outerInset: outerInset.issues,
    innerInset: innerInset.issues,
    depth: depth.issues,
    outerRadius: outerRadius.issues,
    innerRadius: innerRadius.issues,
  }
  const committedValue: RecessedPocketOpeningSchema = {
    type: 'recessed',
    outerInset: outerInset.committedValue,
    innerInset: innerInset.committedValue,
    depth: depth.committedValue,
    outerRadius: outerRadius.committedValue,
    innerRadius: innerRadius.committedValue,
  }

  if (!outerInset.isValid || !innerInset.isValid || !depth.isValid || !outerRadius.isValid || !innerRadius.isValid) {
    return createInvalidValidationResult<RecessedPocketOpeningSchema>(issues, committedValue)
  }

  return createValidValidationResult<RecessedPocketOpeningSchema>(
    issues,
    {
      type: 'recessed',
      outerInset: outerInset.value,
      innerInset: innerInset.value,
      depth: depth.value,
      outerRadius: outerRadius.value,
      innerRadius: innerRadius.value,
    },
    committedValue,
  )
}
