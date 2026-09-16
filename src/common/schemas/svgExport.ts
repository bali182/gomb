import type BigNumber from 'bignumber.js'

import type { HasTypeSchema } from './common'
import type { ComponentSchema, PocketClusterSchema } from './components'
import type { ComputedStitchHoleSchema, ComputedTPocketSchema, ComputedTopPocketSchema } from './computed'
import type { PathSchema, RectSchema } from './geometry'
import type { BaseExportSettingsSchema } from './settings'
import type { ResolvedStitchLineSchema } from './stitching'
import type { SubProjectSchema } from './subProject'

export type SvgExportStitchLineSchema = {
  stitchLine: ResolvedStitchLineSchema
  paths: PathSchema[]
  holes: ComputedStitchHoleSchema[]
}

export type SvgExportPanelSchema = HasTypeSchema<'svg-export-panel'> & {
  id: string
  subProject: SubProjectSchema
  component: ComponentSchema
  boundingRect: RectSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  path: PathSchema
  childMarkerPaths: PathSchema[]
  stitchLines: SvgExportStitchLineSchema[]
}

export type SvgExportFrontPocketSchema = HasTypeSchema<'svg-export-front-pocket'> & {
  id: string
  subProject: SubProjectSchema
  ownerComponent: PocketClusterSchema
  pocket: ComputedTopPocketSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  stitchLines: SvgExportStitchLineSchema[]
}

export type SvgExportTPocketSchema = HasTypeSchema<'svg-export-t-pocket'> & {
  id: string
  subProject: SubProjectSchema
  ownerComponent: PocketClusterSchema
  pocketIndex: number
  pocket: ComputedTPocketSchema
  cutHelper?: PathSchema
  cutHelperBoundingRect?: RectSchema
  stitchLines: SvgExportStitchLineSchema[]
}

export type SvgExportElementSchema = SvgExportPanelSchema | SvgExportFrontPocketSchema | SvgExportTPocketSchema

export type SvgExportSchema = {
  settings: BaseExportSettingsSchema
  contentWidth: BigNumber
  contentHeight: BigNumber
  elements: SvgExportElementSchema[]
}
