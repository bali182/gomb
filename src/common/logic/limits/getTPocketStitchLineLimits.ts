import type {
  ComputedPocketClusterSchema,
  ComputedStitchLineSchema,
  ComputedTPocketSchema,
} from '../../schemas/computed'
import type { TPocketStitchLineLimitsSchema } from '../../schemas/limits'
import type { ResolvedTPocketStitchLineSchema } from '../../schemas/stitching'

/** Entry point for future pocket-route and stitching-setting bounds. */
export const getTPocketStitchLineLimits = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  _computed: ComputedStitchLineSchema,
  _target: ComputedTPocketSchema | ComputedPocketClusterSchema,
): TPocketStitchLineLimitsSchema => ({ type: stitchLine.type })
