import type { RootPanelSchema } from '../../schemas/components'
import type { ComputedRootPanelSchema } from '../../schemas/computed'
import type { RootPanelLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getCornerRadiusLimits } from './getCornerRadiusLimits'

export const getRootPanelLimits = (
  rootPanel: RootPanelSchema,
  computed: ComputedRootPanelSchema,
): RootPanelLimitsSchema => ({
  type: rootPanel.type,
  ...getCornerRadiusLimits({ boundingRect: computed.boundingRect, cornerRadius: getCornerRadius(rootPanel) }),
})
