import { ZERO } from '../../constants/layout'
import type { PocketClusterSchema, PocketOrientationSchema } from '../../schemas/components'
import type { CornerRadiusSchema } from '../../schemas/geometry'
import type { CornerRadiusLimitsSchema, NumericFieldLimitsSchema } from '../../schemas/limits'
import { isDefined } from '../../utils/isDefined'
import { getCornerRadiusLimits, type GetCornerRadiusLimitsParams } from './getCornerRadiusLimits'

export type GetPocketClusterCornerRadiusLimitsParams = GetCornerRadiusLimitsParams & {
  pocketCluster: PocketClusterSchema
}

/** Opening-side radii are ignored, including when calculating limits for the closed side. */
export const getPocketClusterCornerRadiusLimits = ({
  pocketCluster,
  cornerRadius,
  parentCornerRadius,
  ...params
}: GetPocketClusterCornerRadiusLimitsParams): CornerRadiusLimitsSchema => {
  const { orientation } = pocketCluster
  const limits = getCornerRadiusLimits({
    ...params,
    cornerRadius: getClosedSideCornerRadius(cornerRadius, orientation),
    parentCornerRadius: isDefined(parentCornerRadius)
      ? getClosedSideCornerRadius(parentCornerRadius, orientation)
      : undefined,
  })
  const ignored: NumericFieldLimitsSchema = {
    max: { value: ZERO, reason: 'pocket-opening-corner-radius-ignored', severity: 'info' },
  }
  switch (orientation) {
    case 'up':
      return { ...limits, topLeftRadius: ignored, topRightRadius: ignored }
    case 'down':
      return { ...limits, bottomLeftRadius: ignored, bottomRightRadius: ignored }
    case 'left':
      return { ...limits, topLeftRadius: ignored, bottomLeftRadius: ignored }
    case 'right':
      return { ...limits, topRightRadius: ignored, bottomRightRadius: ignored }
  }
}

const getClosedSideCornerRadius = (
  cornerRadius: CornerRadiusSchema,
  orientation: PocketOrientationSchema,
): CornerRadiusSchema => {
  switch (orientation) {
    case 'up':
      return { ...cornerRadius, topLeft: ZERO, topRight: ZERO }
    case 'down':
      return { ...cornerRadius, bottomLeft: ZERO, bottomRight: ZERO }
    case 'left':
      return { ...cornerRadius, topLeft: ZERO, bottomLeft: ZERO }
    case 'right':
      return { ...cornerRadius, topRight: ZERO, bottomRight: ZERO }
  }
}
