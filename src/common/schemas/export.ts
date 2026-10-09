import type BigNumber from 'bignumber.js'

import type { HasTypeSchema } from './common'
import type { ComponentSchema, PocketClusterSchema } from './components'
import type { ComputedStitchHoleSchema, ComputedTPocketSchema, ComputedTopPocketSchema } from './computed'
import type { PathSchema, RectSchema } from './geometry'
import type { ResolvedStitchLineSchema } from './stitching'
import type { SubProjectSchema } from './subProject'

export type ExportStitchLineSchema = {
  stitchLine: ResolvedStitchLineSchema
  paths: PathSchema[]
  holes: ComputedStitchHoleSchema[]
}

export type ExportPanelSchema = HasTypeSchema<'export-panel'> & {
  id: string
  subProject: SubProjectSchema
  component: ComponentSchema
  boundingRect: RectSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  path: PathSchema
  childMarkerPaths: PathSchema[]
  stitchLines: ExportStitchLineSchema[]
}

export type ExportFrontPocketSchema = HasTypeSchema<'export-front-pocket'> & {
  id: string
  subProject: SubProjectSchema
  ownerComponent: PocketClusterSchema
  pocket: ComputedTopPocketSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  stitchLines: ExportStitchLineSchema[]
}

export type ExportTPocketSchema = HasTypeSchema<'export-t-pocket'> & {
  id: string
  subProject: SubProjectSchema
  ownerComponent: PocketClusterSchema
  pocketIndex: number
  pocket: ComputedTPocketSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  stitchLines: ExportStitchLineSchema[]
}

export type ExportElementSchema = ExportPanelSchema | ExportFrontPocketSchema | ExportTPocketSchema

export type ExportFormatSchema = 'svg' | 'pdf'

export type PageOrientationSchema = 'portrait' | 'landscape'
export type PageLayoutSchema = 'vertical' | 'horizontal' | 'compact'
export type ExportPlacementRotation = 0 | 90

export type ExportPlacementSchema = {
  boundingRect: RectSchema
  /** The page-space footprint after compact-layout rotation. */
  placementBoundingRect: RectSchema
  rotation: ExportPlacementRotation
  x: BigNumber
  y: BigNumber
}

export type ExportPageElementSchema = {
  element: ExportElementSchema
  placement: ExportPlacementSchema
}

export type ExportPageSchema = {
  boundingRect: RectSchema
  elements: ExportPageElementSchema[]
}

export type ExportSuccessfulLayoutSchema = HasTypeSchema<'successful-export'> & {
  pages: ExportPageSchema[]
}

export type ExportUnsuccessfulLayoutSchema = HasTypeSchema<'unsuccessful-export'> & {
  unplaceables: ExportPanelSchema[]
}

export type ExportLayoutSchema = ExportSuccessfulLayoutSchema | ExportUnsuccessfulLayoutSchema
