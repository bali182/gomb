import { STROKE_THICKNESS } from './constants/drawing'
import {
  leatherColors,
  pocketItemColors,
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
  HasStretchSchema,
  HasXYOffsetSchema,
} from './schemas/common'
import type {
  FrontPocketSchema,
  HasAutoDimensionsSchema,
  HasLayoutSchema,
  HasPocketItemSchema,
  PanelSchema,
  PocketClusterSchema,
  RecessedPocketOpeningSchema,
  RootPanelSchema,
  SlantedPocketOpeningSchema,
  TPocketSchema,
} from './schemas/components'
import type { HasAnchorsSchema, HoleSchema } from './schemas/hole'
import type { ColorSettingsSchema, ExportSettingsSchema } from './schemas/settings'

import type {
  ComponentBoundsStitchLineOwnSchema,
  StitchLineCommonConfigSchema,
  TPocketStitchLineOwnSchema,
} from './schemas/stitching'

export const defaultStitchingSettings: StitchLineCommonConfigSchema = {
  stitchMargin: 4,
  stitchHoleLength: 1.7,
  stitchHoleDistance: 3.38,
  stitchHoleThickness: 0.3,
  stitchLineThickness: STROKE_THICKNESS,
}

export const defaultExportParams: ExportSettingsSchema = {
  gap: 10,
  padding: 10,
  stitchLineMode: 'related-stitch-lines',
  showNames: true,
  showDimensions: true,
  showParentNames: true,
  childMarkers: true,
  cutHelperDistance: 0,
  format: 'pdf',
  page: 'A4',
  orientation: 'portrait',
  layout: 'compact',
}

export const defaultColorSettings: ColorSettingsSchema = {
  leatherColor: leatherColors.natural,
  stitchHoleColor: stitchHoleColors.black,
  stitchLineColor: stitchLineColors.black,
  strokeColor: strokeColors.black,
  selectionColor: selectionColors.selectionBlue,
  pocketItemColor: pocketItemColors.mediumGreen,
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
  mainAxisAnchor: 'start',
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

export const defaultHasStretch: HasStretchSchema = {
  individualStretch: true,
  topStretch: 0,
  rightStretch: 0,
  bottomStretch: 0,
  leftStretch: 0,
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
  ...defaultHasStretch,
  type: 'panel',
  children: [],
}

export const defaultRecessedPocketOpening: RecessedPocketOpeningSchema = {
  type: 'recessed',
  outerInset: 15,
  innerOffset: 15,
  depth: 10,
  outerRadius: 10,
  innerRadius: 10,
}

export const defaultSlantedPocketOpening: SlantedPocketOpeningSchema = {
  type: 'slanted',
  offset: 15,
  side: 'end',
}

export const defaultHasPocketItem: HasPocketItemSchema = {
  itemOrientation: 'landscape',
  itemCrossAxisOffset: 0,
  itemOpeningOffset: 0,
}

export const defaultFrontPocket: Omit<FrontPocketSchema, keyof HasId | keyof HasName> = {
  ...defaultHasPocketItem,
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  type: 'front-pocket',
  children: [],
  opening: { type: 'straight' },
}
export const defaultTPocket: Omit<TPocketSchema, keyof HasId | keyof HasName> = {
  ...defaultHasPocketItem,
  type: 't-pocket',
  children: [],
  opening: { type: 'straight' },
  tPocketTabWidth: 8,
  tPocketTaper: 20,
}
export const defaultPocketCluster: Omit<PocketClusterSchema, keyof HasId | keyof HasName> = {
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasStretch,
  type: 'pocket-cluster',
  children: [],
  orientation: 'up',
  pocketStep: 10,
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

export const defaultTPocketStitchLine: TPocketStitchLineOwnSchema = {
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
