import BigNumber from 'bignumber.js'
import { POSITION_EPSILON } from '../../constants/layout'
import type { ComponentBoundsStitchLineLimitsSchema, NumericBoundSchema } from '../../schemas/limits'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getPointDistance } from '../geometryUtils'
import type { ComponentBoundsStitchLineGeometry } from '../stitching/getComponentBoundsStitchLineGeometry'

export const getComponentBoundsStitchLineOffsetLimits = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  geometry: ComponentBoundsStitchLineGeometry,
): ComponentBoundsStitchLineLimitsSchema => {
  const limits: ComponentBoundsStitchLineLimitsSchema = { type: stitchLine.type }
  if (geometry.isClosed) {
    return limits
  }
  const first = geometry.fragments[0]
  const last = geometry.fragments[geometry.fragments.length - 1]
  const singleSide = geometry.fragments.length === 1
  if (isDefined(first) && narrowers.path.is.sideFragment(first)) {
    limits.startOffset = {
      min: getMinimumOffset(singleSide ? stitchLine.endOffset : 0, getPointDistance(first.start, first.end)),
    }
  }
  if (isDefined(last) && narrowers.path.is.sideFragment(last)) {
    limits.endOffset = {
      min: getMinimumOffset(singleSide ? stitchLine.startOffset : 0, getPointDistance(last.start, last.end)),
    }
  }
  return limits
}

const getMinimumOffset = (oppositeOffset: number, length: BigNumber): NumericBoundSchema => {
  const available = BigNumber.maximum(length.minus(POSITION_EPSILON), 0)
  const half = available.dividedBy(2)
  const opposite = new BigNumber(oppositeOffset)
  return {
    value: opposite.lt(half.negated()) ? half.negated() : available.plus(opposite).negated(),
    reason: 'stitch-offset-exceeds-side-length',
    severity: 'warning',
  }
}
