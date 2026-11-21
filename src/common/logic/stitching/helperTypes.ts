import type { HasComponentReferenceSchema, HasStitchLineReferenceSchema, HasTargetSchema } from '../../schemas/common'
import type {
  ComputedStitchHoleSchema,
  ComputedStitchSchema,
  HasBoundingRectSchema,
  HasPathSchema,
  StitchPathFragment,
} from '../../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../../schemas/geometry'
import type { StitchLineSchema, StitchSideSchema } from '../../schemas/stitching'

export type ComponentBoundsStitchLineTarget = {
  componentId: string
  boundingRect: RectSchema
  cornerRadius: CornerRadiusSchema
}

export type StitchRouteGeometry = HasTargetSchema &
  HasBoundingRectSchema &
  HasPathSchema & {
    fragments: StitchPathFragment[]
    holes: ComputedStitchHoleSchema[]
    isClosed: boolean
    stitches: ComputedStitchSchema[]
    labelPosition: StitchSideSchema
  }

export type StitchLineGeometry = HasTargetSchema &
  HasBoundingRectSchema &
  HasStitchLineReferenceSchema &
  HasComponentReferenceSchema & {
    type: StitchLineSchema['type']
    autoComputedCornerRadius: CornerRadiusSchema
    routes: StitchRouteGeometry[]
  }
