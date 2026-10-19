import type { ComputedStitchLineSchema } from '../../schemas/computed'
import type { ComponentBoundsStitchLineLimitsSchema } from '../../schemas/limits'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import type { ComponentBoundsStitchLineTarget } from '../stitching/helperTypes'
import { getComponentBoundsStitchLineCornerRadiusLimits } from './getComponentBoundsStitchLineCornerRadiusLimits'

export const getComponentBoundsStitchLineLimits = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  _computed: ComputedStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): ComponentBoundsStitchLineLimitsSchema => ({
  type: stitchLine.type,
  ...getComponentBoundsStitchLineCornerRadiusLimits(stitchLine, target),
})
