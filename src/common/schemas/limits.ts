import type BigNumber from 'bignumber.js'
import type { HasCornerRadiusValuesSchema, HasStretchValuesSchema, HasTypeSchema } from './common'
import type {
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketsSchema,
  RootPanelSchema,
  TPocketSchema,
} from './components'
import type { HoleSchema } from './hole'
import type { SeveritySchema } from './issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from './pocketOpening'
import type { ComponentBoundsStitchLineSchema, TPocketStitchLineSchema } from './stitching'
import type { NumericFieldNameSchema } from './utils'

export type CornerRadiusLimitReasonSchema =
  /** A touching parent corner requires a larger radius. */
  | 'parent-corner-radius'
  /** The radius is limited by the available edge length. */
  | 'corner-radius-exceeds-edge-length'
  /** Two corners share the available length of the same edge. */
  | 'corner-radii-share-edge'
  /** Cluster corner rounding is ignored on the pocket opening side. */
  | 'pocket-opening-corner-radius-ignored'

export type RecessedPocketOpeningLimitsReasonSchema =
  /** The opening parameters share the available width. */
  | 'pocket-opening-width'
  /** The recess must remain inside the pocket outline. */
  | 'pocket-opening-boundary'
  /** At least 1 mm of pocket material must remain below the recess. */
  | 'pocket-opening-depth'

export type SlantedPocketOpeningLimitsReasonSchema =
  /** The shortened endpoint and its T-pocket shoulder must not pass the pocket's closed edge or corner rounding. */
  'slanted-pocket-opening-offset-exceeds-pocket'

export type StretchLimitReasonSchema =
  /** Compression cannot exceed the component's original size along this axis. Applies when the opposite edge is neither stretched nor compressed. */
  | 'stretch-component-size'
  /** Compression is limited by the remaining size after opposite-edge stretch, or half the original size if that edge compresses beyond halfway. */
  | 'stretch-opposite-edge'

export type PocketClusterLimitReasonSchema =
  /** Pocket spacing cannot exceed the cluster's stack-axis length divided by the pocket count. */
  | 'cluster-size-and-pocket-count'
  /** Shoulder insets extend inward from both sides and cannot exceed half the pocket width. */
  | 't-pocket-tab-width-exceeds-half-width'
  /** Bottom taper extends inward from both sides and cannot exceed half the pocket width. */
  | 't-pocket-taper-exceeds-half-width'

export type OpticalIllusionPocketOpeningLimitsReasonSchema =
  /** The cluster diagonal's endpoint insets share the opening width. An inset exceeding half the width yields to the opposite inset up to halfway. */
  | 'optical-illusion-pocket-opening-insets-share-width'
  /** The leading radius is limited so its tangent point remains on the straight section before the diagonal. */
  | 'optical-illusion-pocket-opening-radius-exceeds-leading-length'
  /** The trailing radius is limited so its tangent point remains on the straight section after the diagonal. */
  | 'optical-illusion-pocket-opening-radius-exceeds-trailing-length'
  /** Both rounded transitions consume the diagonal's length. A transition consuming more than half yields to the other up to halfway, preventing overlap. */
  | 'optical-illusion-pocket-opening-radii-share-slanted-length'

export type LimitReasonSchema =
  | OpticalIllusionPocketOpeningLimitsReasonSchema
  | CornerRadiusLimitReasonSchema
  | RecessedPocketOpeningLimitsReasonSchema
  | StretchLimitReasonSchema
  | PocketClusterLimitReasonSchema
  | SlantedPocketOpeningLimitsReasonSchema

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
export type SlantedPocketOpeningLimitsSchema = NumericLimitsSchema<SlantedPocketOpeningSchema>
export type OpticalIllusionPocketOpeningLimitsSchema = NumericLimitsSchema<OpticalIllusionPocketOpeningSchema>
export type PocketOpeningLimitsSchema =
  | OpticalIllusionPocketOpeningLimitsSchema
  | StraightPocketOpeningLimitsSchema
  | RecessedPocketOpeningLimitsSchema
  | SlantedPocketOpeningLimitsSchema
export type PocketClusterLimitsSchema = NumericLimitsSchema<PocketClusterSchema>
export type FrontPocketLimitsSchema = NumericLimitsSchema<FrontPocketSchema> & { opening: PocketOpeningLimitsSchema }
export type TPocketLimitsSchema = NumericLimitsSchema<TPocketSchema> & { opening: PocketOpeningLimitsSchema }
export type ComponentLimitsSchema =
  | RootPanelLimitsSchema
  | PanelLimitsSchema
  | PocketClusterLimitsSchema
  | FrontPocketLimitsSchema
  | TPocketLimitsSchema
export type ComponentBoundsStitchLineLimitsSchema = NumericLimitsSchema<ComponentBoundsStitchLineSchema>
export type TPocketStitchLineLimitsSchema = NumericLimitsSchema<TPocketStitchLineSchema>
export type StitchLineLimitsSchema = ComponentBoundsStitchLineLimitsSchema | TPocketStitchLineLimitsSchema
export type CornerRadiusLimitsSchema = Partial<
  Record<NumericFieldNameSchema<HasCornerRadiusValuesSchema>, NumericFieldLimitsSchema>
>
export type StretchLimitsSchema = Record<keyof HasStretchValuesSchema, NumericFieldLimitsSchema>
export type PocketsLimitsSchema = Partial<Record<NumericFieldNameSchema<PocketsSchema>, NumericFieldLimitsSchema>>
export type SubProjectLimitsSchema = {
  components: Record<string, ComponentLimitsSchema>
  holes: Record<string, HoleLimitsSchema>
  stitchLines: Record<string, StitchLineLimitsSchema>
}
