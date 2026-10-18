import { defaultRecessedPocketOpening } from '../defaultStates'
import type { HasIdentitySchema } from '../schemas/common'
import type { PocketOpeningOwnSchema, PocketOpeningSchema, RecessedPocketOpeningSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketOpeningSchema = (
  input: EditableSchema<PocketOpeningSchema>,
  currentValue: PocketOpeningSchema,
  openings: readonly HasIdentitySchema[],
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketOpeningSchema> => {
  const ownResult = validatePocketOpeningOwnSchema(input, currentValue, context)
  const nameResult = validateName(input.name, currentValue.name, currentValue.id, openings, context)
  const issues: IssuesSchema<PocketOpeningSchema> = {
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

const validatePocketOpeningOwnSchema = (
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
      return validateRecessedPocketOpeningSchema(
        input,
        currentValue.type === 'recessed' ? currentValue : defaultRecessedPocketOpening,
        context,
      )
  }
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
