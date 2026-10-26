import { pocketItems } from '../data/pocketItems'
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
  const id = validatePrimitiveUnion(input.itemId, currentValue.itemId, pocketItems, context, true)
  const orientation = validatePrimitiveUnion(
    input.itemOrientation,
    currentValue.itemOrientation,
    { landscape: true, portrait: true },
    context,
  )
  const crossAxisOffset = validateNumber(input.itemCrossAxisOffset, currentValue.itemCrossAxisOffset, context)
  const openingOffset = validateNumber(input.itemOpeningOffset, currentValue.itemOpeningOffset, context, {
    min: 0,
  })
  const issues: IssuesSchema<HasPocketItemSchema> = {
    itemId: id.issues,
    itemOrientation: orientation.issues,
    itemCrossAxisOffset: crossAxisOffset.issues,
    itemOpeningOffset: openingOffset.issues,
  }
  const committedValue: HasPocketItemSchema = {
    itemId: id.committedValue,
    itemOrientation: orientation.committedValue,
    itemCrossAxisOffset: crossAxisOffset.committedValue,
    itemOpeningOffset: openingOffset.committedValue,
  }
  if (!id.isValid || !orientation.isValid || !crossAxisOffset.isValid || !openingOffset.isValid) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(issues, committedValue)
}
