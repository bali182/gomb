import { ComponentSchema } from './components'
import { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from './computed'
import { RectSchema } from './geometry'
import { HoleSchema } from './hole'
import { StitchLineSchema } from './stitching'

export type SubProjectSchema = {
  id: string
  root: string
  components: Record<string, ComponentSchema>
  holes: HoleSchema[]
  stitchLines: StitchLineSchema[]
}

export type ComputedSubProjectSchema = {
  id: string
  root: string
  components: Record<string, ComputedComponentSchema>
  holes: ComputedHoleSchema[]
  /** Mapping between the component the stitchlines are drawn on top, and the stitchline itself. */
  stitchLines: Record<string, ComputedStitchLineSchema[]>
  viewBox: RectSchema
}
