import type { ComputedStitchLineSchema } from '../../schemas/computed'
import type { ComponentBoundsStitchLineLimitsSchema } from '../../schemas/limits'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { getComponentBoundsStitchLineGeometry } from '../stitching/getComponentBoundsStitchLineGeometry'
import type { ComponentBoundsStitchLineTarget } from '../stitching/helperTypes'
import { getComponentBoundsStitchLineCornerRadiusLimits } from './getComponentBoundsStitchLineCornerRadiusLimits'
import { getComponentBoundsStitchLineOffsetLimits } from './getComponentBoundsStitchLineOffsetLimits'

export const getComponentBoundsStitchLineLimits = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  _computed: ComputedStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): ComponentBoundsStitchLineLimitsSchema => ({
  ...getComponentBoundsStitchLineCornerRadiusLimits(stitchLine, target),
  ...getComponentBoundsStitchLineOffsetLimits(stitchLine, getComponentBoundsStitchLineGeometry(stitchLine, target)),
})
