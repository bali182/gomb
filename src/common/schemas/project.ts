import { HasIdentitySchema } from './common'
import { ColorSettingsSchema } from './settings'
import { StitchLineCommonConfigSchema } from './stitching'
import { ComputedSubProjectSchema, SubProjectSchema } from './subProject'

export type ProjectSchema = HasIdentitySchema & {
  version: string
  subProjects: SubProjectSchema[]
  stitchingSettings: StitchLineCommonConfigSchema
  colorSettings: ColorSettingsSchema
}

export type ComputedProjectSchema = HasIdentitySchema & {
  subProjects: ComputedSubProjectSchema[]
}
