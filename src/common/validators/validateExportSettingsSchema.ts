import type { EditableSchema } from '../schemas/editable'
import type { ExportFormatSchema, PageLayoutSchema, PageOrientationSchema } from '../schemas/export'
import type { IssuesSchema } from '../schemas/issues'
import type { PageSchemaId } from '../schemas/page'
import type { ExportSettingsSchema } from '../schemas/settings'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'
import { validateNumber } from './validateNumber'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

const exportFormats: Record<ExportFormatSchema, boolean> = { svg: true, pdf: true, png: true }

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
  const formatResult = validatePrimitiveUnion(input.format, currentValue.format, exportFormats, context)
  const pageResult = validatePrimitiveUnion(input.page, currentValue.page, pageSchemaIds, context)
  const orientationResult = validatePrimitiveUnion(
    input.orientation,
    currentValue.orientation,
    pageOrientations,
    context,
  )
  const layoutResult = validatePrimitiveUnion(input.layout, currentValue.layout, pageLayouts, context)

  const issues: IssuesSchema<ExportSettingsSchema> = {
    childMarkers: undefined,
    cutHelperDistance: cutHelperDistanceResult.issues,
    gap: gapResult.issues,
    padding: paddingResult.issues,
    showDimensions: undefined,
    showNames: undefined,
    showParentNames: undefined,
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
    showParentNames: input.showParentNames,
    format: formatResult.committedValue,
    layout: layoutResult.committedValue,
    orientation: orientationResult.committedValue,
    page: pageResult.committedValue,
  }

  if (
    !gapResult.isValid ||
    !paddingResult.isValid ||
    !cutHelperDistanceResult.isValid ||
    !formatResult.isValid ||
    !pageResult.isValid ||
    !orientationResult.isValid ||
    !layoutResult.isValid
  ) {
    return createInvalidValidationResult(issues, committedValue)
  }

  return createValidValidationResult(issues, committedValue)
}
