import type { ComputedPocketClusterSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { PocketClusterStitchLineLimitsSchema } from '../../schemas/limits'
import type { ResolvedPocketClusterStitchLineSchema } from '../../schemas/stitching'

/** Entry point for future pocket-route and stitching-setting bounds. */
export const getPocketClusterStitchLineLimits = (
  stitchLine: ResolvedPocketClusterStitchLineSchema,
  _computed: ComputedStitchLineSchema,
  _pocketCluster: ComputedPocketClusterSchema,
): PocketClusterStitchLineLimitsSchema => ({ type: stitchLine.type })
