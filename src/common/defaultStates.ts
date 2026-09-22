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
import type {
  HasComponentReferenceSchema,
  HasCornerRadiusSchema,
  HasId,
  HasName,
  HasOffAxisAnchor,
  HasSqueezeSchema,
  HasXYOffsetSchema,
} from './schemas/common'
import type {
  HasAutoDimensionsSchema,
  HasLayoutSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
} from './schemas/components'
import type { HasAnchorsSchema, HoleSchema } from './schemas/hole'
import type { MagicFixSettingsSchema } from './schemas/magic-fix-3/magicFixSettings3'
import type { PdfExportSettingsSchema } from './schemas/pdfExport'
import type { BaseExportSettingsSchema, ColorSettingsSchema } from './schemas/settings'
import type {
  ComponentBoundsStitchLineOwnSchema,
  PocketClusterStitchLineOwnSchema,
  StitchLineCommonConfigSchema,
} from './schemas/stitching'

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
  stitchLineMode: 'related-stitch-lines',
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

export const defaultHasCornerRadius: HasCornerRadiusSchema = {
  topLeftRadius: 0,
  bottomLeftRadius: 0,
  bottomRightRadius: 0,
  topRightRadius: 0,
  individualRadii: false,
}

export const defaultHasLayout: HasLayoutSchema = {
  layoutOrientation: 'horizontal',
  layoutGap: 0,
  autoLayoutGap: false,
}

export const defaultHasFillableSize: HasAutoDimensionsSchema = {
  width: 10,
  height: 10,
  autoHeight: true,
  autoWidth: true,
}

export const defaultHasOffAxisAnchor: HasOffAxisAnchor = {
  offAxisAnchor: 'middle',
}

export const defaultHasSqueeze: HasSqueezeSchema = {
  individualSqueeze: true,
  topSqueeze: 0,
  rightSqueeze: 0,
  bottomSqueeze: 0,
  leftSqueeze: 0,
}

export const defaultRootPanel: Omit<RootPanelSchema, keyof HasId | keyof HasName> = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  type: 'root-panel',
  children: [],
  width: 100,
  height: 100,
}

export const defaultPanel: Omit<PanelSchema, keyof HasId | keyof HasName> = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasSqueeze,
  type: 'panel',
  children: [],
}

export const defaultPocketCluster: Omit<PocketClusterSchema, keyof HasId | keyof HasName> = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasSqueeze,
  type: 'pocket-cluster',
  children: [],
  orientation: 'up',
  pocketCount: 3,
  pocketStep: 10,
  tPocketTabWidth: 8,
  tPocketTaper: 20,
}

export const defaultComponentBoundsStitchLine: ComponentBoundsStitchLineOwnSchema = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  topLeftCorner: true,
  topRightCorner: true,
  bottomRightCorner: true,
  bottomLeftCorner: true,
  topStitchDirection: 'left-to-right',
  rightStitchDirection: 'top-to-bottom',
  bottomStitchDirection: 'right-to-left',
  leftStitchDirection: 'bottom-to-top',
  stitchDisconnectedBottomLeftCorner: false,
  stitchDisconnectedBottomRightCorner: false,
  stitchDisconnectedTopLeftCorner: false,
  stitchDisconnectedTopRightCorner: false,
  topStartOffset: 0,
  topEndOffset: 0,
  rightStartOffset: 0,
  rightEndOffset: 0,
  bottomStartOffset: 0,
  bottomEndOffset: 0,
  leftStartOffset: 0,
  leftEndOffset: 0,
  autoCornerRadius: true,
  individualRadii: false,
  bottomLeftRadius: 0,
  bottomRightRadius: 0,
  topLeftRadius: 0,
  topRightRadius: 0,
}

export const defaultPocketClusterStitchLine: PocketClusterStitchLineOwnSchema = {
  endOffset: 0,
  startOffset: 0,
  stitchDirection: 'start-to-end',
}

export const defaultHasAnchors: HasAnchorsSchema = {
  xAnchor: 'middle',
  yAnchor: 'middle',
}

export const defaultHasXYOffsets: HasXYOffsetSchema = {
  xOffset: 0,
  yOffset: 0,
}

export const defaultHole: Omit<HoleSchema, keyof HasId | keyof HasName | keyof HasComponentReferenceSchema> = {
  ...defaultHasAnchors,
  ...defaultHasXYOffsets,
  ...defaultHasCornerRadius,
  type: 'hole',
  height: 20,
  width: 20,
}
