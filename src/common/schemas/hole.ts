import {
  AnchorSchema,
  HasAutoDimensionsSchema,
  HasComponentReferenceSchema,
  HasCornerRadiusSchema,
  HasIdentitySchema,
  HasStretchSchema,
  HasTypeSchema,
  HasXYOffsetSchema,
} from './common'

export type HasAnchorsSchema = {
  xAnchor: AnchorSchema
  yAnchor: AnchorSchema
}

export type HoleSchema = HasTypeSchema<'hole'> &
  HasXYOffsetSchema &
  HasIdentitySchema &
  HasComponentReferenceSchema &
  HasAnchorsSchema &
  HasAutoDimensionsSchema &
  HasStretchSchema &
  HasCornerRadiusSchema
