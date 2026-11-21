import type { ComputedComponentSchema, ComputedHoleSchema } from '../../schemas/computed'
import type { HoleSchema } from '../../schemas/hole'
import type { HoleLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getCornerRadiusLimits } from './getCornerRadiusLimits'
import { getStretchLimits } from './getStretchLimits'

export const getHoleLimits = (
  hole: HoleSchema,
  computed: ComputedHoleSchema,
  _owner: ComputedComponentSchema,
): HoleLimitsSchema => ({
  type: hole.type,
  ...getStretchLimits(hole, computed.layoutBoundingRect),
  // A hole's owning component does not impose parent-corner minima.
  ...getCornerRadiusLimits({ boundingRect: computed.boundingRect, cornerRadius: getCornerRadius(hole) }),
})
