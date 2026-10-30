import { ComponentSchema } from './components'
import { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from './computed'
import { RectSchema } from './geometry'
import { HoleSchema } from './hole'
import type { SubProjectLimitsSchema } from './limits'
import { StitchLineSchema } from './stitching'

export type SubProjectSchema = {
  id: string
  root: string
  components: Record<string, ComponentSchema>
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
