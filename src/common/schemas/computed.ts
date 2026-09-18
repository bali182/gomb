import type BigNumber from 'bignumber.js'

import { HasComponentReferenceSchema, HasId, HasTargetSchema, HasTypeSchema } from './common'
import { CornerRadiusSchema, LineSchema, PathSchema, PointSchema, RectSchema } from './geometry'
import { StitchCornerSchema, StitchSideSchema } from './stitching'
import { CardSchema } from './valuables'

export type ComputedStitchHoleSchema = {
  center: PointSchema
  rotation: number
  line: LineSchema
}

export type ComputedStitchSchema = {
  line: LineSchema
}

export type HasPathSchema = {
  path: PathSchema
}

export type HasBoundingRectSchema = {
  boundingRect: RectSchema
}

export type HasLayoutBoundingRectSchema = {
  layoutBoundingRect: RectSchema
}

export type HasComputedCornerRadiusSchema = {
  cornerRadius: CornerRadiusSchema
}

export type HasUncutPathSchema = {
  uncutPath: PathSchema
}

export type HasComputedChildrenSchema = {
  children: ComputedComponentSchema[]
}

export type HasComputedLayoutGapSchema = {
  computedLayoutGap: BigNumber
}

export type HasComputedCardSchema = {
  card?: ComputedCardSchema
}

export type BaseComputedSchema = HasComponentReferenceSchema & HasPathSchema & HasBoundingRectSchema

export type ComputedRootPanelSchema = HasTypeSchema<'computed-root-panel'> &
  BaseComputedSchema &
  HasUncutPathSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasComputedChildrenSchema

export type ComputedPanelSchema = HasTypeSchema<'computed-panel'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasUncutPathSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasComputedChildrenSchema

export type ComputedTopPocketSchema = HasTypeSchema<'computed-top-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasUncutPathSchema &
  HasId &
  HasComputedCardSchema

export type ComputedTPocketSchema = HasTypeSchema<'computed-t-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasUncutPathSchema &
  HasId &
  HasComputedCardSchema

export type ComputedCardSchema = HasTypeSchema<'computed-card'> &
  HasPathSchema &
  HasComputedCornerRadiusSchema &
  HasBoundingRectSchema & {
    card: CardSchema
  }

export type ComputedPocketClusterSchema = HasTypeSchema<'computed-pocket-cluster'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasUncutPathSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasComputedChildrenSchema & {
    frontPocket: ComputedTopPocketSchema
    tPockets: ComputedTPocketSchema[]
  }

export type ComputedComponentSchema = ComputedRootPanelSchema | ComputedPanelSchema | ComputedPocketClusterSchema

export type ComputedHoleSchema = BaseComputedSchema &
  HasComputedCornerRadiusSchema & {
    holeId: string
    highlightPath: PathSchema
  }

export type ComputedStitchRouteDisconnectedCornerSchema = {
  side: StitchSideSchema
  hole: ComputedStitchHoleSchema
}

export type ComputedStitchRouteSchema = HasBoundingRectSchema & {
  path: PathSchema
  holes: ComputedStitchHoleSchema[]
  isClosed: boolean
  stitches: ComputedStitchSchema[]
  labelPosition: StitchSideSchema
  disconnectedCorners: Record<StitchCornerSchema, ComputedStitchRouteDisconnectedCornerSchema | undefined>
}

export type ComputedStitchLineSchema = HasTargetSchema &
  HasBoundingRectSchema & {
    stitchLineId: string
    componentId: string
    autoComputedCornerRadius: CornerRadiusSchema
    routes: ComputedStitchRouteSchema[]
    connectingStitches: ComputedStitchSchema[]
  }
