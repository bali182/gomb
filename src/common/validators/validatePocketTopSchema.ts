import { defaultRecessedPocketTop } from '../defaultStates'
import type { PocketTopSchema, RecessedPocketTopSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { BaseValidationContextSchema, ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketTopSchema = (
  input: EditableSchema<PocketTopSchema>,
  currentValue: PocketTopSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<PocketTopSchema> => {
  const typeResult = validatePrimitiveUnion(input.type, currentValue.type, { straight: true, recessed: true }, context)

  if (!typeResult.isValid) {
    return createInvalidValidationResult<PocketTopSchema>({ type: typeResult.issues }, currentValue)
  }

  switch (input.type) {
    case 'straight':
      return createValidValidationResult<PocketTopSchema>({ type: undefined }, { type: 'straight' })
    case 'recessed':
      return validateRecessedPocketTopSchema(
        input,
        currentValue.type === 'recessed' ? currentValue : defaultRecessedPocketTop,
        context,
      )
  }
}

const validateRecessedPocketTopSchema = (
  input: EditableSchema<RecessedPocketTopSchema>,
  currentValue: RecessedPocketTopSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<RecessedPocketTopSchema> => {
  const outerInset = validateNumber(input.outerInset, currentValue.outerInset, context, { min: 0 })
  const innerInset = validateNumber(input.innerInset, currentValue.innerInset, context, { min: 0 })
  const depth = validateNumber(input.depth, currentValue.depth, context, { min: 0 })
  const outerRadius = validateNumber(input.outerRadius, currentValue.outerRadius, context, { min: 0 })
  const innerRadius = validateNumber(input.innerRadius, currentValue.innerRadius, context, { min: 0 })
  const issues: ValidationIssuesSchema<RecessedPocketTopSchema> = {
    type: undefined,
    outerInset: outerInset.issues,
    innerInset: innerInset.issues,
    depth: depth.issues,
    outerRadius: outerRadius.issues,
    innerRadius: innerRadius.issues,
  }
  const committedValue: RecessedPocketTopSchema = {
    type: 'recessed',
    outerInset: outerInset.committedValue,
    innerInset: innerInset.committedValue,
    depth: depth.committedValue,
    outerRadius: outerRadius.committedValue,
    innerRadius: innerRadius.committedValue,
  }

  if (!outerInset.isValid || !innerInset.isValid || !depth.isValid || !outerRadius.isValid || !innerRadius.isValid) {
    return createInvalidValidationResult<RecessedPocketTopSchema>(issues, committedValue)
  }

  return createValidValidationResult<RecessedPocketTopSchema>(
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
