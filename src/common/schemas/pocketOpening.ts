import { HasIdentitySchema, HasTypeSchema } from './common'

export type PocketOpeningSideSchema = 'start' | 'end'

export type StraightPocketOpeningSchema = HasTypeSchema<'straight'> & HasIdentitySchema

export type RecessedPocketOpeningGeometrySchema = {
  /** Distance inward from either opening edge, in mm. */
  outerInset: number
  /** Distance outward from the opening center, in mm. */
  innerOffset: number
  depth: number
}

export type RecessedPocketOpeningCornerRadiusSchema = {
  outerRadius: number
  innerRadius: number
}

export type RecessedPocketOpeningOwnSchema = RecessedPocketOpeningGeometrySchema &
  RecessedPocketOpeningCornerRadiusSchema

export type RecessedPocketOpeningSchema = HasTypeSchema<'recessed'> & HasIdentitySchema & RecessedPocketOpeningOwnSchema

export type SlantedPocketOpeningOwnSchema = {
  /** Inward displacement of the selected opening endpoint, in mm. */
  offset: number
  /** Endpoint in the opening's traversal direction, rotating with the cluster. */
  side: PocketOpeningSideSchema
}

export type SlantedPocketOpeningSchema = HasTypeSchema<'slanted'> & HasIdentitySchema & SlantedPocketOpeningOwnSchema

export type OpticalIllusionPocketOpeningGeometrySchema = {
  direction: PocketOpeningSideSchema
  startInset: number
  endInset: number
}

export type OpticalIllusionPocketOpeningCornerRadiusSchema = {
  leadingRadius: number
  trailingRadius: number
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
