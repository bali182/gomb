import type { HasPocketItemSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const validatePocketItemSchema = (
  input: EditableSchema<HasPocketItemSchema>,
  currentValue: HasPocketItemSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<HasPocketItemSchema> => {
  const id = validatePrimitiveUnion(
    input.pocketItemId,
    currentValue.pocketItemId,
    { 'ID-1': true, 'ID-2': true, 'ID-3': true },
    context,
    true,
  )
  const orientation = validatePrimitiveUnion(
    input.pocketItemOrientation,
    currentValue.pocketItemOrientation,
    { landscape: true, portrait: true },
    context,
  )
  const crossAxisOffset = validateNumber(
    input.pocketItemCrossAxisOffset,
    currentValue.pocketItemCrossAxisOffset,
    context,
  )
  const openingOffset = validateNumber(input.pocketItemOpeningOffset, currentValue.pocketItemOpeningOffset, context, {
    min: 0,
  })
  const issues: IssuesSchema<HasPocketItemSchema> = {
    pocketItemId: id.issues,
    pocketItemOrientation: orientation.issues,
    pocketItemCrossAxisOffset: crossAxisOffset.issues,
    pocketItemOpeningOffset: openingOffset.issues,
  }
  const committedValue: HasPocketItemSchema = {
    pocketItemId: id.committedValue,
    pocketItemOrientation: orientation.committedValue,
    pocketItemCrossAxisOffset: crossAxisOffset.committedValue,
    pocketItemOpeningOffset: openingOffset.committedValue,
  }
  if (!id.isValid || !orientation.isValid || !crossAxisOffset.isValid || !openingOffset.isValid) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(issues, committedValue)
}
