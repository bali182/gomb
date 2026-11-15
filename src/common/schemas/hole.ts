import {
  AnchorSchema,
  HasComponentReferenceSchema,
  HasCornerRadiusValuesSchema,
  HasIdentitySchema,
  HasSizeSchema,
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
  HasSizeSchema &
  HasCornerRadiusValuesSchema
