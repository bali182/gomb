import {
  HasAnchorsSchema,
  HasAutoDimensionsSchema,
  HasComponentReferenceSchema,
  HasCornerRadiusSchema,
  HasIdentitySchema,
  HasStretchSchema,
  HasTypeSchema,
  HasXYOffsetSchema,
} from './common'

export type HoleSchema = HasTypeSchema<'hole'> &
  HasIdentitySchema &
  HasComponentReferenceSchema &
  HasAnchorsSchema &
  HasXYOffsetSchema &
  HasAutoDimensionsSchema &
  HasStretchSchema &
  HasCornerRadiusSchema
