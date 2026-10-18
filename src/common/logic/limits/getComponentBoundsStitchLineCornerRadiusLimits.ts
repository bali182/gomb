import BigNumber from 'bignumber.js'
import type { RectSchema } from '../../schemas/geometry'
import type { CornerRadiusLimitsSchema } from '../../schemas/limits'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { getCornerRadius } from '../cornerRadiusUtils'
import type { ComponentBoundsStitchLineTarget } from '../stitching/helperTypes'
import { getCornerRadiusLimits } from './getCornerRadiusLimits'

/** Auto radii do not use the manual radius fields and therefore have no field limits. */
export const getComponentBoundsStitchLineCornerRadiusLimits = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): CornerRadiusLimitsSchema => {
  if (stitchLine.autoCornerRadius) {
    return {}
  }
  return getCornerRadiusLimits({
    boundingRect: getAdjustedBoundingRect(stitchLine, target),
    cornerRadius: getCornerRadius(stitchLine),
  })
}

const getAdjustedBoundingRect = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): RectSchema => {
  const margin = new BigNumber(stitchLine.stitchMargin)
  const { x, y, width, height } = target.boundingRect
  switch (stitchLine.targetType) {
    case 'component':
      return {
        x: x.plus(margin),
        y: y.plus(margin),
        width: width.minus(margin.times(2)),
        height: height.minus(margin.times(2)),
      }
    case 'hole':
      return {
        x: x.minus(margin),
        y: y.minus(margin),
        width: width.plus(margin.times(2)),
        height: height.plus(margin.times(2)),
      }
  }
}
