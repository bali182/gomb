import type { EditableSchema } from '../schemas/editable'
import type { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from '../schemas/stitching'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { validateComponentBoundsStitchLineSchema } from './validateComponentBoundsStitchLineSchema'
import { validateTPocketStitchLineSchema } from './validateTPocketStitchLineSchema'

export const validateStitchLineSchema = (
  input: EditableSchema<StitchLineSchema>,
  currentValue: StitchLineSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<StitchLineSchema> => {
  switch (currentValue.type) {
    case 'component-bounds-stitch-line':
      return validateComponentBoundsStitchLineSchema(
        input as EditableSchema<ComponentBoundsStitchLineSchema>,
        currentValue,
        context,
      )
    case 't-pocket-stitch-line':
      return validateTPocketStitchLineSchema(input as EditableSchema<TPocketStitchLineSchema>, currentValue, context)
  }
}
