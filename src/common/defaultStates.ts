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
  HasAnchorsSchema,
  HasAutoDimensionsSchema,
  HasComponentReferenceSchema,
  HasCornerRadiusSchema,
  HasId,
  HasIdentitySchema,
  HasName,
  HasOffAxisAnchor,
  HasStretchSchema,
  HasXYOffsetSchema,
} from './schemas/common'
import type {
  FrontPocketSchema,
  GuideSchema,
  HasFacesSchema,
  HasLayoutSchema,
  HasPocketItemSchema,
  HasPocketOpeningSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelFaceSchema,
  RootPanelSchema,
  TPocketSchema,
} from './schemas/components'
import type { HoleSchema } from './schemas/hole'
import type {
  OpticalIllusionPocketOpeningOwnSchema,
  RecessedPocketOpeningOwnSchema,
  SlantedPocketOpeningOwnSchema,
} from './schemas/pocketOpening'
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
  topStretch: 0,
  rightStretch: 0,
  bottomStretch: 0,
  leftStretch: 0,
}

export const defaultRootPanel: Omit<RootPanelSchema, keyof HasId | keyof HasName | keyof HasFacesSchema> = {
  ...defaultHasCornerRadius,
  type: 'root-panel',
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

export const defaultRecessedPocketOpening: RecessedPocketOpeningOwnSchema = {
  recessOuterInset: 15,
  recessInnerOffset: 15,
  recessDepth: 10,
  recessOuterRadius: 10,
  recessInnerRadius: 10,
}

export const defaultOpticalIllusionPocketOpening: OpticalIllusionPocketOpeningOwnSchema = {
  illusionSide: 'start',
  illusionStartInset: 10,
  illusionEndInset: 10,
  illusionLeadingRadius: 0,
  illusionTrailingRadius: 0,
}

export const defaultSlantedPocketOpening: SlantedPocketOpeningOwnSchema = {
  slantOffset: 15,
  slantSide: 'start',
}

export const defaultHasPocketItem: HasPocketItemSchema = {
  itemOrientation: 'portrait',
  itemCrossAxisOffset: 0,
  itemOpeningOffset: 0,
}

export const defaultFrontPocket: Omit<FrontPocketSchema, keyof HasId | keyof HasName | keyof HasPocketOpeningSchema> = {
  ...defaultHasPocketItem,
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  type: 'front-pocket',
  children: [],
}
export const defaultTPocket: Omit<TPocketSchema, keyof HasId | keyof HasName | keyof HasPocketOpeningSchema> = {
  ...defaultHasPocketItem,
  type: 't-pocket',
  children: [],
  tPocketTabWidth: 8,
  tPocketTaper: 20,
}
export const defaultPocketCluster: Omit<PocketClusterSchema, keyof HasId | keyof HasName> = {
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasStretch,
  ...defaultHasCornerRadius,
  type: 'pocket-cluster',
  children: [],
  orientation: 'up',
  pocketStep: 10,
}

export const defaultComponentBoundsStitchLine: ComponentBoundsStitchLineOwnSchema = {
  startOffset: 0,
  endOffset: 0,
  stitchDirection: 'start-to-end',
  top: true,
  right: true,
  bottom: true,
  left: true,
  topLeftCorner: true,
  topRightCorner: true,
  bottomRightCorner: true,
  bottomLeftCorner: true,
  autoCornerRadius: true,
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
  ...defaultHasStretch,
  type: 'hole',
  autoWidth: false,
  autoHeight: false,
  height: 20,
  width: 20,
}

export const defaultRootPanelFace: Omit<RootPanelFaceSchema, keyof HasIdentitySchema> = {
  type: 'root-panel-face',
  ...defaultHasLayout,
  children: [],
}

export const defaultGuide: Omit<GuideSchema, keyof HasIdentitySchema> = {
  type: 'guide',
  ...defaultHasFillableSize,
  ...defaultHasAnchors,
  ...defaultHasXYOffsets,
  ...defaultHasStretch,
  ...defaultHasCornerRadius,
  ...defaultHasLayout,
  children: [],
}
