import type { ComputedStitchLineSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { TPocketStitchLineLimitsSchema } from '../../schemas/limits'
import type { ResolvedTPocketStitchLineSchema } from '../../schemas/stitching'

/** Entry point for future pocket-route and stitching-setting bounds. */
export const getTPocketStitchLineLimits = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  _computed: ComputedStitchLineSchema,
  _pocketCluster: ComputedTPocketSchema,
): TPocketStitchLineLimitsSchema => ({ type: stitchLine.type })
