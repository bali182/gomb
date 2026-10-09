import type { EditableSchema } from '../schemas/editable'
import type { ExportFormatSchema, PageLayoutSchema, PageOrientationSchema } from '../schemas/export'
import type { PageSchemaId } from '../schemas/page'
import type { ExportSettingsSchema, ExportStitchLineModeSchema } from '../schemas/settings'
import type { BaseValidationContextSchema, ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

export const exportStitchLineModes: Record<ExportStitchLineModeSchema, boolean> = {
  'all-stitch-lines': true,
  'own-stitch-lines': true,
  'related-stitch-lines': true,
}

const exportFormats: Record<ExportFormatSchema, boolean> = { svg: true, pdf: true }

const pageSchemaIds: Record<PageSchemaId, boolean> = {
  A3: true,
  A4: true,
  A5: true,
}

const pageOrientations: Record<PageOrientationSchema, boolean> = {
  landscape: true,
  portrait: true,
}

const pageLayouts: Record<PageLayoutSchema, boolean> = {
  compact: true,
  horizontal: true,
  vertical: true,
}

export const validateExportSettingsSchema = (
  input: EditableSchema<ExportSettingsSchema>,
  currentValue: ExportSettingsSchema,
  context: BaseValidationContextSchema,
): ValidationResultSchema<ExportSettingsSchema> => {
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
  const formatResult = validatePrimitiveUnion(input.format, currentValue.format, exportFormats, context)
  const pageResult = validatePrimitiveUnion(input.page, currentValue.page, pageSchemaIds, context)
  const orientationResult = validatePrimitiveUnion(
    input.orientation,
    currentValue.orientation,
    pageOrientations,
    context,
  )
  const layoutResult = validatePrimitiveUnion(input.layout, currentValue.layout, pageLayouts, context)

  const issues: ValidationIssuesSchema<ExportSettingsSchema> = {
    childMarkers: undefined,
    cutHelperDistance: cutHelperDistanceResult.issues,
    gap: gapResult.issues,
    padding: paddingResult.issues,
    showDimensions: undefined,
    showNames: undefined,
    stitchLineMode: stitchLineModeResult.issues,
    format: formatResult.issues,
    layout: layoutResult.issues,
    orientation: orientationResult.issues,
    page: pageResult.issues,
  }
  const committedValue: ExportSettingsSchema = {
    childMarkers: input.childMarkers,
    cutHelperDistance: cutHelperDistanceResult.committedValue,
    gap: gapResult.committedValue,
    padding: paddingResult.committedValue,
    showDimensions: input.showDimensions,
    showNames: input.showNames,
    stitchLineMode: stitchLineModeResult.committedValue,
    format: formatResult.committedValue,
    layout: layoutResult.committedValue,
    orientation: orientationResult.committedValue,
    page: pageResult.committedValue,
  }

  if (
    !gapResult.isValid ||
    !paddingResult.isValid ||
    !cutHelperDistanceResult.isValid ||
    !stitchLineModeResult.isValid ||
    !formatResult.isValid ||
    !pageResult.isValid ||
    !orientationResult.isValid ||
    !layoutResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
