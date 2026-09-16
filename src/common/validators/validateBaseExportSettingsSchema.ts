import type { EditableSchema } from '../schemas/editable'
import type { BaseExportSettingsSchema, ExportStitchLineModeSchema } from '../schemas/settings'
import type { BaseValidationContextSchema, ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const exportStitchLineModes: Record<ExportStitchLineModeSchema, boolean> = {
  'all-stitch-lines': true,
  'own-stitch-lines': true,
  'related-stitch-lines': true,
}

export const validateBaseExportSettingsSchema = (
  input: EditableSchema<BaseExportSettingsSchema>,
  currentValue: BaseExportSettingsSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<BaseExportSettingsSchema> => {
  const gapResult = validateNumber(input.gap, currentValue.gap, context, { min: 0 })
  const paddingResult = validateNumber(input.padding, currentValue.padding, context, { min: 0 })
  const cutHelperDistanceResult = validateNumber(input.cutHelperDistance, currentValue.cutHelperDistance, context, {
    min: 0,
  })
  const stitchLineModeResult = validatePrimitiveUnion(
    input.stitchLineMode,
    currentValue.stitchLineMode,
    exportStitchLineModes,
    context,
  )

  const issues: ValidationIssuesSchema<BaseExportSettingsSchema> = {
    childMarkers: undefined,
    cutHelperDistance: cutHelperDistanceResult.issues,
    gap: gapResult.issues,
    padding: paddingResult.issues,
    showDimensions: undefined,
    showNames: undefined,
    stitchLineMode: stitchLineModeResult.issues,
  }
  const committedValue: BaseExportSettingsSchema = {
    childMarkers: input.childMarkers,
    cutHelperDistance: cutHelperDistanceResult.committedValue,
    gap: gapResult.committedValue,
    padding: paddingResult.committedValue,
    showDimensions: input.showDimensions,
    showNames: input.showNames,
    stitchLineMode: stitchLineModeResult.committedValue,
  }

  if (
    !gapResult.isValid ||
    !paddingResult.isValid ||
    !cutHelperDistanceResult.isValid ||
    !stitchLineModeResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
