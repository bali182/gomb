import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { validateFrontPocketSchema } from './validateFrontPocketSchema'
import { validatePanelSchema } from './validatePanelSchema'
import { validatePocketClusterSchema } from './validatePocketClusterSchema'
import { validateRootPanelSchema } from './validateRootPanelSchema'
import { validateTPocketSchema } from './validateTPocketSchema'

export function validateComponentSchema(
  input: EditableSchema<ComponentSchema>,
  currentValue: ComponentSchema,
  context: ComponentBasedValidationContextSchema,
): ValidationResultSchema<ComponentSchema> {
  switch (input.type) {
    case 'front-pocket':
      return validateFrontPocketSchema(input, currentValue as FrontPocketSchema, context)
    case 't-pocket':
      return validateTPocketSchema(input, currentValue as TPocketSchema, context)
    case 'root-panel':
      return validateRootPanelSchema(input, currentValue as RootPanelSchema, context)
    case 'panel':
      return validatePanelSchema(input, currentValue as PanelSchema, context)
    case 'pocket-cluster':
      return validatePocketClusterSchema(input, currentValue as PocketClusterSchema, context)
  }
}
