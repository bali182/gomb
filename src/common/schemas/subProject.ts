import type { ComponentSchema } from './components'
import type { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from './computed'
import type { RectSchema } from './geometry'
import type { HoleSchema } from './hole'
import type { SubProjectLimitsSchema } from './limits'
import type { PocketOpeningSchema } from './pocketOpening'
import type { StitchLineSchema } from './stitching'

export type SubProjectSchema = {
  id: string
  root: string
  defaultPocketOpening: string
  components: Record<string, ComponentSchema>
  pocketOpenings: Record<string, PocketOpeningSchema>
  holes: HoleSchema[]
  stitchLines: StitchLineSchema[]
}

export type ComputedSubProjectGeometrySchema = {
  id: string
  root: string
  components: Record<string, ComputedComponentSchema>
  holes: Record<string, ComputedHoleSchema>
  stitchLines: Record<string, ComputedStitchLineSchema>
  viewBox: RectSchema
}

export type ComputedSubProjectSchema = ComputedSubProjectGeometrySchema & {
  limits: SubProjectLimitsSchema
}
