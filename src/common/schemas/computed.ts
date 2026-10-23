import type BigNumber from 'bignumber.js'

import { HasComponentReferenceSchema, HasTargetSchema, HasTypeSchema } from './common'
import { CornerRadiusSchema, LineSchema, PathSchema, PointSchema, RectSchema } from './geometry'
import { StitchCornerSchema, StitchLineSchema, StitchSideSchema } from './stitching'
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

export type HasComputedChildrenSchema = {
  children: ComputedComponentSchema[]
}

export type HasComputedPocketsSchema = {
  children: ComputedPocketSchema[]
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
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasComputedChildrenSchema

export type ComputedPanelSchema = HasTypeSchema<'computed-panel'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasComputedChildrenSchema

export type ComputedFrontPocketSchema = HasTypeSchema<'computed-front-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasComputedChildrenSchema &
  HasComputedLayoutGapSchema &
  HasComputedCardSchema

export type ComputedTPocketSchema = HasTypeSchema<'computed-t-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasComputedChildrenSchema &
  HasComputedCardSchema

export type ComputedPocketSchema = ComputedFrontPocketSchema | ComputedTPocketSchema

export type ComputedCardSchema = HasTypeSchema<'computed-card'> &
  HasPathSchema &
  HasComputedCornerRadiusSchema &
  HasBoundingRectSchema & {
    card: CardSchema
  }

export type ComputedPocketClusterSchema = HasTypeSchema<'computed-pocket-cluster'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasComputedCornerRadiusSchema &
  HasComputedPocketsSchema

export type ComputedComponentSchema =
  | ComputedRootPanelSchema
  | ComputedPanelSchema
  | ComputedPocketClusterSchema
  | ComputedFrontPocketSchema
  | ComputedTPocketSchema

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
    type: StitchLineSchema['type']
    componentId: string
    onTop: string
    autoComputedCornerRadius: CornerRadiusSchema
    routes: ComputedStitchRouteSchema[]
    connectingStitches: ComputedStitchSchema[]
  }
