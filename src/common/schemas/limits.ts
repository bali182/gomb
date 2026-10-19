import type BigNumber from 'bignumber.js'
import type { HasCornerRadiusValuesSchema, HasTypeSchema } from './common'
import type {
  PanelSchema,
  PocketClusterSchema,
  RecessedPocketOpeningSchema,
  RootPanelSchema,
  StraightPocketOpeningSchema,
} from './components'
import type { HoleSchema } from './hole'
import type { SeveritySchema } from './issues'
import type { ComponentBoundsStitchLineSchema, PocketClusterStitchLineSchema } from './stitching'
import type { NumericFieldNameSchema } from './utils'

export type CornerRadiusLimitReasonSchema =
  /** A touching parent corner requires a larger radius. */
  | 'parent-corner-radius'
  /** The radius is limited by the available edge length. */
  | 'corner-radius-exceeds-edge-length'
  /** Two corners share the available length of the same edge. */
  | 'corner-radii-share-edge'
  /** The opening-side corner radius is limited by the pocket step. */
  | 'opening-corner-radius-exceeds-pocket-step'

export type RecessedPocketOpeningLimitsReasonSchema =
  /** The opening parameters share the available width. */
  | 'pocket-opening-width'
  /** The recess must remain inside the pocket outline. */
  | 'pocket-opening-boundary'
  /** Opening-side corner rounding requires additional clearance. */
  | 'pocket-opening-corner-clearance'
  /** At least 1 mm of pocket material must remain below the recess. */
  | 'pocket-opening-depth'

export type LimitReasonSchema = CornerRadiusLimitReasonSchema | RecessedPocketOpeningLimitsReasonSchema

export type NumericBoundSchema = {
  value: BigNumber
  reason: LimitReasonSchema
  severity: SeveritySchema
}
export type NumericFieldLimitsSchema = {
  min?: NumericBoundSchema
  max?: NumericBoundSchema
}

export type NumericLimitsSchema<T extends HasTypeSchema<string>> = Pick<T, 'type'> &
  Partial<Record<NumericFieldNameSchema<T>, NumericFieldLimitsSchema>>

export type RootPanelLimitsSchema = NumericLimitsSchema<RootPanelSchema>
export type PanelLimitsSchema = NumericLimitsSchema<PanelSchema>
export type HoleLimitsSchema = NumericLimitsSchema<HoleSchema>
export type StraightPocketOpeningLimitsSchema = NumericLimitsSchema<StraightPocketOpeningSchema>
export type RecessedPocketOpeningLimitsSchema = NumericLimitsSchema<RecessedPocketOpeningSchema>
export type PocketOpeningLimitsSchema = StraightPocketOpeningLimitsSchema | RecessedPocketOpeningLimitsSchema
export type PocketClusterLimitsSchema = NumericLimitsSchema<PocketClusterSchema> & {
  openings: Record<string, PocketOpeningLimitsSchema>
}
export type ComponentLimitsSchema = RootPanelLimitsSchema | PanelLimitsSchema | PocketClusterLimitsSchema
export type ComponentBoundsStitchLineLimitsSchema = NumericLimitsSchema<ComponentBoundsStitchLineSchema>
export type PocketClusterStitchLineLimitsSchema = NumericLimitsSchema<PocketClusterStitchLineSchema>
export type StitchLineLimitsSchema = ComponentBoundsStitchLineLimitsSchema | PocketClusterStitchLineLimitsSchema
export type CornerRadiusLimitsSchema = Partial<
  Record<NumericFieldNameSchema<HasCornerRadiusValuesSchema>, NumericFieldLimitsSchema>
>
export type SubProjectLimitsSchema = {
  components: Record<string, ComponentLimitsSchema>
  holes: Record<string, HoleLimitsSchema>
  stitchLines: Record<string, StitchLineLimitsSchema>
}
