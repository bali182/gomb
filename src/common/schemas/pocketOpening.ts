import { HasIdentitySchema, HasTypeSchema } from './common'

export type PocketOpeningSideSchema = 'start' | 'end'

export type StraightPocketOpeningSchema = HasTypeSchema<'straight'> & HasIdentitySchema

export type RecessedPocketOpeningOwnSchema = {
  /** Distance inward from either opening edge, in mm. */
  outerInset: number
  /** Distance outward from the opening center, in mm. */
  innerOffset: number
  outerRadius: number
  innerRadius: number
  depth: number
}

export type RecessedPocketOpeningSchema = HasTypeSchema<'recessed'> & HasIdentitySchema & RecessedPocketOpeningOwnSchema

export type SlantedPocketOpeningOwnSchema = {
  /** Inward displacement of the selected opening endpoint, in mm. */
  offset: number
  /** Endpoint in the opening's traversal direction, rotating with the cluster. */
  side: PocketOpeningSideSchema
}

export type SlantedPocketOpeningSchema = HasTypeSchema<'slanted'> & HasIdentitySchema & SlantedPocketOpeningOwnSchema

export type OpticalIllusionPocketOpeningOwnSchema = {
  direction: PocketOpeningSideSchema
  startInset: number
  endInset: number
  leadingRadius: number
  trailingRadius: number
}

export type OpticalIllusionPocketOpeningSchema = HasTypeSchema<'optical-illusion'> &
  HasIdentitySchema &
  OpticalIllusionPocketOpeningOwnSchema

export type PocketOpeningSchema =
  | StraightPocketOpeningSchema
  | RecessedPocketOpeningSchema
  | SlantedPocketOpeningSchema
  | OpticalIllusionPocketOpeningSchema
