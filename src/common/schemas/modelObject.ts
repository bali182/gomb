import type { ComponentSchema } from './components'
import type { HoleSchema } from './hole'
import type { StitchLineSchema } from './stitching'

export type ModelObjectSchema = ComponentSchema | StitchLineSchema | HoleSchema
