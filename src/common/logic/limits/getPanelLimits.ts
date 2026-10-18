import type { PanelSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPanelSchema } from '../../schemas/computed'
import type { PanelLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getCornerRadiusLimits } from './getCornerRadiusLimits'

export const getPanelLimits = (
  panel: PanelSchema,
  computed: ComputedPanelSchema,
  parent: ComputedComponentSchema,
): PanelLimitsSchema => ({
  type: panel.type,
  ...getCornerRadiusLimits({
    boundingRect: computed.boundingRect,
    cornerRadius: getCornerRadius(panel),
    parentBoundingRect: parent.boundingRect,
    parentCornerRadius: parent.cornerRadius,
  }),
})
