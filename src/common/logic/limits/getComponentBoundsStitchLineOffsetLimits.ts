import BigNumber from 'bignumber.js'
import { POSITION_EPSILON } from '../../constants/layout'
import type { ComponentBoundsStitchLineLimitsSchema, NumericBoundSchema } from '../../schemas/limits'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import type { ComponentBoundsStitchLineGeometry } from '../stitching/getComponentBoundsStitchLineGeometry'
import { getStitchPathFragmentsLength } from '../stitching/stitchLineFragmentGeometry'

export const getComponentBoundsStitchLineOffsetLimits = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  geometry: ComponentBoundsStitchLineGeometry,
): ComponentBoundsStitchLineLimitsSchema => {
  const limits: ComponentBoundsStitchLineLimitsSchema = { type: stitchLine.type }
  if (geometry.isClosed || geometry.fragments.length === 0) {
    return limits
  }
  const length = getStitchPathFragmentsLength(geometry.fragments)
  limits.startOffset = { min: getMinimumOffset(stitchLine.endOffset, length) }
  limits.endOffset = { min: getMinimumOffset(stitchLine.startOffset, length) }
  return limits
}

const getMinimumOffset = (oppositeOffset: number, length: BigNumber): NumericBoundSchema => {
  const opposite = new BigNumber(oppositeOffset)
  const extendedLength = length.plus(BigNumber.maximum(opposite, 0))
  const available = BigNumber.maximum(extendedLength.minus(POSITION_EPSILON), 0)
  const half = available.dividedBy(2)
  let value = available.negated()
  if (opposite.lt(0)) {
    value = opposite.lt(half.negated()) ? half.negated() : available.plus(opposite).negated()
  }
  return {
    value,
    reason: 'stitch-offset-exceeds-route-length',
    severity: 'warning',
  }
}
