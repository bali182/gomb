import type BigNumber from 'bignumber.js'

import { HasComponentReferenceSchema, HasStitchLineReferenceSchema, HasTargetSchema, HasTypeSchema } from './common'
import type { HasChildrenSchema } from './components'
import { CornerRadiusSchema, LineSchema, PathSchema, PointSchema, RectSchema } from './geometry'
import { PocketItemSchema } from './pocketItem'
import {
  HasEntryComponentSchema,
  HasExitComponentSchema,
  StitchCornerSchema,
  StitchLineSchema,
  StitchSideSchema,
} from './stitching'

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

export type HasComputedLayoutGapSchema = {
  computedLayoutGap: BigNumber
}

export type HasComputedPocketItemSchema = {
  item?: ComputedPocketItemSchema
}

export type BaseComputedSchema = HasComponentReferenceSchema & HasPathSchema & HasBoundingRectSchema

export type ComputedRootPanelSchema = HasTypeSchema<'computed-root-panel'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema & { frontFaceId: string; backFaceId: string }

export type ComputedRootPanelFaceSchema = HasTypeSchema<'computed-root-panel-face'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasChildrenSchema

export type ComputedPanelSchema = HasTypeSchema<'computed-panel'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasComputedCornerRadiusSchema &
  HasComputedLayoutGapSchema &
  HasChildrenSchema

export type ComputedFrontPocketSchema = HasTypeSchema<'computed-front-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasChildrenSchema &
  HasComputedLayoutGapSchema &
  HasComputedPocketItemSchema

export type ComputedTPocketSchema = HasTypeSchema<'computed-t-pocket'> &
  BaseComputedSchema &
  HasComputedCornerRadiusSchema &
  HasChildrenSchema &
  HasComputedPocketItemSchema

export type ComputedPocketSchema = ComputedFrontPocketSchema | ComputedTPocketSchema

export type ComputedPocketItemSchema = HasTypeSchema<'computed-pocket-item'> &
  HasPathSchema &
  HasComputedCornerRadiusSchema &
  HasBoundingRectSchema & {
    item: PocketItemSchema
  }

export type ComputedPocketClusterSchema = HasTypeSchema<'computed-pocket-cluster'> &
  BaseComputedSchema &
  HasLayoutBoundingRectSchema &
  HasComputedCornerRadiusSchema &
  HasChildrenSchema

export type ComputedComponentSchema =
  | ComputedRootPanelSchema
  | ComputedRootPanelFaceSchema
  | ComputedPanelSchema
  | ComputedPocketClusterSchema
  | ComputedFrontPocketSchema
  | ComputedTPocketSchema

export type ComputedHoleSchema = BaseComputedSchema &
  HasComputedCornerRadiusSchema & {
    holeId: string
    highlightPath: PathSchema
  }

export type StitchSidePathFragment = {
  type: 'side'
  side: StitchSideSchema
  start: PointSchema
  end: PointSchema
}

export type StitchCornerPathFragment = {
  type: 'corner'
  corner: StitchCornerSchema
  start: PointSchema
  end: PointSchema
  center: PointSchema
  radius: BigNumber
}

export type StitchPathFragment = StitchSidePathFragment | StitchCornerPathFragment

export type ComputedStitchRouteSchema = HasTargetSchema &
  HasBoundingRectSchema &
  HasPathSchema &
  HasStitchLineReferenceSchema &
  Required<HasEntryComponentSchema> &
  Required<HasExitComponentSchema> & {
    faceId: string
    fragments: StitchPathFragment[]
    holes: ComputedStitchHoleSchema[]
    isClosed: boolean
    stitches: ComputedStitchSchema[]
    labelPosition: StitchSideSchema
  }

export type ComputedStitchLineSchema = HasTargetSchema &
  HasBoundingRectSchema &
  HasStitchLineReferenceSchema &
  HasComponentReferenceSchema & {
    type: StitchLineSchema['type']
    autoComputedCornerRadius: CornerRadiusSchema
    routes: ComputedStitchRouteSchema[]
  }
