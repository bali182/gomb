import BigNumber from 'bignumber.js'

import type { HasCornerRadiusSchema } from '../schemas/common'
import type { CornerRadiusSchema } from '../schemas/geometry'

export const getCornerRadius = (component: HasCornerRadiusSchema): CornerRadiusSchema => {
  const { bottomLeftRadius, bottomRightRadius, topLeftRadius, topRightRadius } = component

  return {
    topLeft: new BigNumber(topLeftRadius),
    topRight: new BigNumber(topRightRadius),
    bottomRight: new BigNumber(bottomRightRadius),
    bottomLeft: new BigNumber(bottomLeftRadius),
  }
}

export const getUniformCornerRadius = (r: BigNumber): CornerRadiusSchema => ({
  bottomLeft: r,
  topLeft: r,
  bottomRight: r,
  topRight: r,
})
