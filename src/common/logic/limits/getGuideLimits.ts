import type { GuideSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedGuideSchema } from '../../schemas/computed'
import type { GuideLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getCornerRadiusLimits } from './getCornerRadiusLimits'
import { getStretchLimits } from './getStretchLimits'

export const getGuideLimits = (
  guide: GuideSchema,
  computed: ComputedGuideSchema,
  parent: ComputedComponentSchema,
): GuideLimitsSchema => ({
  type: guide.type,
  ...getStretchLimits(guide, computed.layoutBoundingRect),
  ...getCornerRadiusLimits({
    boundingRect: computed.boundingRect,
    cornerRadius: getCornerRadius(guide),
    parentBoundingRect: parent.boundingRect,
    parentCornerRadius: parent.cornerRadius,
  }),
})
