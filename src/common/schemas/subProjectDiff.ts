import type { ComponentSchema } from './components'
import type { ConstraintSchema } from './constraints'
import type { HoleSchema } from './hole'
import type { PocketOpeningSchema } from './pocketOpening'
import type { StitchLineSchema } from './stitching'

export type ChangeSchema<T> = {
  before: T | undefined
  after: T | undefined
}

export type SubProjectDiffSchema = {
  root?: ChangeSchema<string>
  defaultPocketOpening?: ChangeSchema<string>
  components: Record<string, ChangeSchema<ComponentSchema>>
  holes: Record<string, ChangeSchema<HoleSchema>>
  stitchLines: Record<string, ChangeSchema<StitchLineSchema>>
  pocketOpenings: Record<string, ChangeSchema<PocketOpeningSchema>>
  constraints: Record<string, ChangeSchema<ConstraintSchema>>
}
