import type { TPocketSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateName } from './validateName'
import { validateNumber } from './validateNumber'
import { validateOptionalHexColor } from './validateOptionalHexColor'
import { validatePocketItemSchema } from './validatePocketItemSchema'
import { validatePocketOpeningSchema } from './validatePocketOpeningSchema'
export const validateTPocketSchema = (
  input: EditableSchema<TPocketSchema>,
  currentValue: TPocketSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<TPocketSchema> => {
  const nameResult = validateName(
    input.name,
    currentValue.name,
    currentValue.id,
    Object.values(context.subProject.components),
    context,
  )
  const colorResult = validateOptionalHexColor(input.color, currentValue.color, context)
  const tPocketTabWidthResult = validateNumber(input.tPocketTabWidth, currentValue.tPocketTabWidth, context, {
    min: 0,
    minInclusive: false,
  })
  const tPocketTaperResult = validateNumber(input.tPocketTaper, currentValue.tPocketTaper, context, {
    min: 0,
    minInclusive: false,
  })
  const pocketItemResult = validatePocketItemSchema(input, currentValue, context)
  const openingResult = validatePocketOpeningSchema(input.opening, currentValue.opening, context)

  const issues: IssuesSchema<TPocketSchema> = {
    ...pocketItemResult.issues,
    name: nameResult.issues,
    color: colorResult.issues,
    tPocketTabWidth: tPocketTabWidthResult.issues,
    tPocketTaper: tPocketTaperResult.issues,
    opening: openingResult.issues,
  }
  const committedValue: TPocketSchema = {
    ...currentValue,
    ...pocketItemResult.committedValue,
    name: nameResult.committedValue,
    color: colorResult.committedValue,
    tPocketTabWidth: tPocketTabWidthResult.committedValue,
    tPocketTaper: tPocketTaperResult.committedValue,
    opening: openingResult.committedValue,
  }
  if (
    !nameResult.isValid ||
    !colorResult.isValid ||
    !tPocketTabWidthResult.isValid ||
    !tPocketTaperResult.isValid ||
    !pocketItemResult.isValid ||
    !openingResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }
  return createValidValidationResult(issues, committedValue)
}
