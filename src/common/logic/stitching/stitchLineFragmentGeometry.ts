import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { StitchPathFragment } from '../../schemas/computed'
import { narrowers } from '../../utils/narrowers'
import type { PathSegment } from '../pathSegmentTypes'
import { getAngle, getPathSegmentLength, getPathSegmentRange } from '../pathSegmentUtils'

export const getStitchPathFragmentLength = (fragment: StitchPathFragment): BigNumber => {
  return getPathSegmentLength(getStitchPathFragmentSegment(fragment))
}

export const getStitchPathFragmentsLength = (fragments: StitchPathFragment[]): BigNumber => {
  return fragments.reduce((length, fragment): BigNumber => length.plus(getStitchPathFragmentLength(fragment)), ZERO)
}

export const getStitchPathFragmentRange = (
  fragment: StitchPathFragment,
  startProgress: BigNumber,
  endProgress: BigNumber,
): StitchPathFragment => {
  const range = getPathSegmentRange(getStitchPathFragmentSegment(fragment), startProgress, endProgress)
  return {
    ...fragment,
    start: startProgress.isZero() ? fragment.start : range.start,
    end: endProgress.eq(1) ? fragment.end : range.end,
  }
}

const getStitchPathFragmentSegment = (fragment: StitchPathFragment): PathSegment => {
  if (narrowers.path.is.sideFragment(fragment)) {
    return { type: 'line', start: fragment.start, end: fragment.end }
  }
  const startX = fragment.start.x.minus(fragment.center.x)
  const startY = fragment.start.y.minus(fragment.center.y)
  const endX = fragment.end.x.minus(fragment.center.x)
  const endY = fragment.end.y.minus(fragment.center.y)
  // Cross/dot avoids subtracting almost identical angles for epsilon-length arcs.
  const cross = startX.times(endY).minus(startY.times(endX))
  const dot = startX.times(endX).plus(startY.times(endY))
  return {
    type: 'arc',
    start: fragment.start,
    end: fragment.end,
    center: fragment.center,
    radius: fragment.radius,
    reversed: false,
    startAngle: getAngle(fragment.center, fragment.start),
    sweepAngle: Math.max(0, Math.atan2(cross.toNumber(), dot.toNumber())),
  }
}
