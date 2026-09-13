import { STROKE_THICKNESS } from './constants/drawing'
import {
  cardColors,
  leatherColors,
  selectionColors,
  stitchHoleColors,
  stitchLineColors,
  strokeColors,
  threadColors,
} from './data/colors'
import { MagicFixSettingsSchema } from './schemas/magic-fix-3/magicFixSettings3'
import { PdfExportSettingsSchema } from './schemas/pdfExport'
import { BaseExportSettingsSchema, ColorSettingsSchema } from './schemas/settings'
import { StitchLineCommonConfigSchema } from './schemas/stitching'

export const defaultStitchingSettings: StitchLineCommonConfigSchema = {
  stitchMargin: 4,
  stitchHoleLength: 1.7,
  stitchHoleDistance: 3.38,
  stitchHoleThickness: 0.3,
  stitchLineThickness: STROKE_THICKNESS,
}

export const defaultSvgExportParams: BaseExportSettingsSchema = {
  gap: 10,
  padding: 10,
  stitchLineMode: 'all-stitch-lines',
  showNames: true,
  showDimensions: true,
  childMarkers: true,
  cutHelperDistance: 0,
}

export const defaultPdfExportParams: PdfExportSettingsSchema = {
  ...defaultSvgExportParams,
  page: 'A4',
  orientation: 'portrait',
  layout: 'compact',
}

export const defaultMagicFix3Settings: MagicFixSettingsSchema = {
  accuracy: 0.01,
  minimumEdgeDistance: 2,
  minimumEdgeCrossingMultiplier: 0.5,
  dimensionModifyRange: { maxDecreaseMultiplier: 0.5, maxIncreaseMultiplier: 0.5 },
  stitchLineOffsetModifyRange: { maxDecreaseMultiplier: 0.5, maxIncreaseMultiplier: 0.5 },
}

export const defaultColorSettings: ColorSettingsSchema = {
  leatherColor: leatherColors.natural,
  stitchHoleColor: stitchHoleColors.black,
  stitchLineColor: stitchLineColors.black,
  strokeColor: strokeColors.black,
  selectionColor: selectionColors.selectionBlue,
  cardColor: cardColors.mediumGreen,
  threadColor: threadColors.white,
}
