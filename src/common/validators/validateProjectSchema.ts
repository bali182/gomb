import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ProjectSchema } from '../schemas/project'
import type { ProjectBasedValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateColorSettings } from './validateColorSettings'
import { validateName } from './validateName'
import { validateStitchLineCommonConfigSchema } from './validateStitchLineCommonConfigSchema'

export const validateProjectSchema = (
  input: EditableSchema<ProjectSchema>,
  currentValue: ProjectSchema,
  context: ProjectBasedValidationContextSchema,
): ValidationResultSchema<ProjectSchema> => {
  const nameResult = validateName(input.name, currentValue.name, currentValue.id, context.projects, context)
  const stitchingSettingsResult = validateStitchLineCommonConfigSchema(
    input.stitchingSettings,
    currentValue.stitchingSettings,
    context,
  )
  const colorSettingsResult = validateColorSettings(input.colorSettings, currentValue.colorSettings, context)
  const issues: IssuesSchema<ProjectSchema> = {
    id: undefined,
    name: nameResult.issues,
    version: undefined,
    subProjects: [],
    colorSettings: colorSettingsResult.issues,
    stitchingSettings: stitchingSettingsResult.issues,
  }
  const committedValue: ProjectSchema = {
    id: currentValue.id,
    name: nameResult.committedValue,
    version: currentValue.version,
    subProjects: currentValue.subProjects,
    stitchingSettings: stitchingSettingsResult.committedValue,
    colorSettings: colorSettingsResult.committedValue,
  }

  if (!nameResult.isValid || !stitchingSettingsResult.isValid || !colorSettingsResult.isValid) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
