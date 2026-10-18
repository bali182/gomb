import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import { CornerRadiusSchema } from '../../schemas/geometry'
import { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getAdjustedCornerRadius } from '../getAdjustedCornerRadius'
import { getComponentBoundsStitchLineCornerRadiusLimits } from '../limits/getComponentBoundsStitchLineCornerRadiusLimits'
import { ComponentBoundsStitchLineTarget } from './helperTypes'

export const getStitchLineAutoCornerRadius = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): CornerRadiusSchema => {
  const margin = new BigNumber(stitchLine.stitchMargin)
  return {
    bottomLeft: getCorner(target.cornerRadius.bottomLeft, margin, stitchLine.targetType),
    bottomRight: getCorner(target.cornerRadius.bottomRight, margin, stitchLine.targetType),
    topLeft: getCorner(target.cornerRadius.topLeft, margin, stitchLine.targetType),
    topRight: getCorner(target.cornerRadius.topRight, margin, stitchLine.targetType),
  }
}

export const getStitchLineCornerRadius = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): CornerRadiusSchema => {
  if (stitchLine.autoCornerRadius) {
    return getStitchLineAutoCornerRadius(stitchLine, target)
  }
  return getAdjustedCornerRadius(
    getCornerRadius(stitchLine),
    getComponentBoundsStitchLineCornerRadiusLimits(stitchLine, target),
  )
}

const getCorner = (
  cornerRadius: BigNumber,
  margin: BigNumber,
  targetType: ResolvedComponentBoundsStitchLineSchema['targetType'],
): BigNumber => {
  switch (targetType) {
    case 'component':
      return BigNumber.maximum(cornerRadius.minus(margin), ZERO)
    case 'hole':
      return cornerRadius.isZero() ? ZERO : cornerRadius.plus(margin)
  }
}
