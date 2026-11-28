import { HasIdentitySchema, HasTypeSchema } from './common'

export type PocketOpeningSideSchema = 'start' | 'end'

export type StraightPocketOpeningSchema = HasTypeSchema<'straight'> & HasIdentitySchema

export type RecessedPocketOpeningMarginSchema = {
  recessStartMargin: number
  recessEndMargin: number
}

export type RecessedPocketOpeningGeometrySchema = {
  /** Distance inward from either edge of the opening between its margins, in mm. */
  recessOuterInset: number
  /** Distance outward from the center between the opening margins, in mm. */
  recessInnerOffset: number
  recessDepth: number
}

export type RecessedPocketOpeningCornerRadiusSchema = {
  recessOuterRadius: number
  recessInnerRadius: number
}

export type RecessedPocketOpeningOwnSchema = RecessedPocketOpeningMarginSchema &
  RecessedPocketOpeningGeometrySchema &
  RecessedPocketOpeningCornerRadiusSchema

export type RecessedPocketOpeningSchema = HasTypeSchema<'recessed'> & HasIdentitySchema & RecessedPocketOpeningOwnSchema

export type SlantedPocketOpeningOwnSchema = {
  /** Inward displacement of the selected opening endpoint, in mm. */
  slantOffset: number
  /** Endpoint in the opening's traversal direction, rotating with the cluster. */
  slantSide: PocketOpeningSideSchema
}

export type SlantedPocketOpeningSchema = HasTypeSchema<'slanted'> & HasIdentitySchema & SlantedPocketOpeningOwnSchema

export type OpticalIllusionPocketOpeningGeometrySchema = {
  illusionSide: PocketOpeningSideSchema
  illusionStartInset: number
  illusionEndInset: number
}

export type OpticalIllusionPocketOpeningCornerRadiusSchema = {
  illusionLeadingRadius: number
  illusionTrailingRadius: number
}

export type OpticalIllusionPocketOpeningOwnSchema = OpticalIllusionPocketOpeningGeometrySchema &
  OpticalIllusionPocketOpeningCornerRadiusSchema

export type OpticalIllusionPocketOpeningSchema = HasTypeSchema<'optical-illusion'> &
  HasIdentitySchema &
  OpticalIllusionPocketOpeningOwnSchema

export type PocketOpeningSchema =
  | StraightPocketOpeningSchema
  | RecessedPocketOpeningSchema
  | SlantedPocketOpeningSchema
  | OpticalIllusionPocketOpeningSchema
