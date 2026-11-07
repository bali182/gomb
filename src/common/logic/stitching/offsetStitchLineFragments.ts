import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { StitchPathFragment } from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import type { StitchCornerSchema, StitchSideSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getStitchPathFragmentLength, getStitchPathFragmentRange } from './stitchLineFragmentGeometry'

export const offsetStitchLineFragments = (
  fragments: StitchPathFragment[],
  startOffset: BigNumber,
  endOffset: BigNumber,
): StitchPathFragment[] => {
  let result = [...fragments]
  if (startOffset.gt(ZERO)) {
    result = extendStitchLineFragments(result, startOffset, 'start')
  }
  if (endOffset.gt(ZERO)) {
    result = extendStitchLineFragments(result, endOffset, 'end')
  }
  if (startOffset.lt(ZERO)) {
    result = trimStitchLineFragments(result, startOffset.negated(), 'start')
  }
  if (endOffset.lt(ZERO)) {
    result = trimStitchLineFragments(result, endOffset.negated(), 'end')
  }
  return result.filter(
    (fragment) => narrowers.path.is.cornerFragment(fragment) || getStitchPathFragmentLength(fragment).gt(ZERO),
  )
}

const extendStitchLineFragments = (
  fragments: StitchPathFragment[],
  offset: BigNumber,
  endpoint: 'start' | 'end',
): StitchPathFragment[] => {
  const index = endpoint === 'start' ? 0 : fragments.length - 1
  const fragment = fragments[index]
  if (!isDefined(fragment)) {
    return fragments
  }
  const point = fragment[endpoint]
  const side = narrowers.path.is.sideFragment(fragment)
    ? fragment.side
    : getStitchCornerEndpointSide(fragment.corner, endpoint)
  const extendedPoint = offsetSidePoint(point, side, endpoint === 'start' ? offset.negated() : offset)
  if (narrowers.path.is.sideFragment(fragment)) {
    return fragments.map(
      (current, currentIndex): StitchPathFragment =>
        currentIndex === index ? { ...current, [endpoint]: extendedPoint } : current,
    )
  }
  const extension: StitchPathFragment = {
    type: 'side',
    side,
    start: endpoint === 'start' ? extendedPoint : point,
    end: endpoint === 'start' ? point : extendedPoint,
  }
  return endpoint === 'start' ? [extension, ...fragments] : [...fragments, extension]
}

const trimStitchLineFragments = (
  fragments: StitchPathFragment[],
  offset: BigNumber,
  endpoint: 'start' | 'end',
): StitchPathFragment[] => {
  let remaining = offset
  for (let traversed = 0; traversed < fragments.length; traversed += 1) {
    const index = endpoint === 'start' ? traversed : fragments.length - 1 - traversed
    const fragment = fragments[index]
    if (remaining.isZero()) {
      return endpoint === 'start' ? fragments.slice(index) : fragments.slice(0, index + 1)
    }
    const length = getStitchPathFragmentLength(fragment)
    if (remaining.gte(length)) {
      remaining = remaining.minus(length)
      continue
    }
    let trimmed: StitchPathFragment
    if (narrowers.path.is.sideFragment(fragment)) {
      const point = offsetSidePoint(
        fragment[endpoint],
        fragment.side,
        endpoint === 'start' ? remaining : remaining.negated(),
      )
      trimmed = { ...fragment, [endpoint]: point }
    } else {
      const progress = remaining.dividedBy(length)
      trimmed =
        endpoint === 'start'
          ? getStitchPathFragmentRange(fragment, progress, new BigNumber(1))
          : getStitchPathFragmentRange(fragment, ZERO, new BigNumber(1).minus(progress))
    }
    return endpoint === 'start' ? [trimmed, ...fragments.slice(index + 1)] : [...fragments.slice(0, index), trimmed]
  }
  return []
}

const offsetSidePoint = (point: PointSchema, side: StitchSideSchema, offset: BigNumber): PointSchema => {
  switch (side) {
    case 'top':
      return { x: point.x.plus(offset), y: point.y }
    case 'right':
      return { x: point.x, y: point.y.plus(offset) }
    case 'bottom':
      return { x: point.x.minus(offset), y: point.y }
    case 'left':
      return { x: point.x, y: point.y.minus(offset) }
  }
}

const getStitchCornerEndpointSide = (corner: StitchCornerSchema, endpoint: 'start' | 'end'): StitchSideSchema => {
  switch (corner) {
    case 'top-right':
      return endpoint === 'start' ? 'top' : 'right'
    case 'bottom-right':
      return endpoint === 'start' ? 'right' : 'bottom'
    case 'bottom-left':
      return endpoint === 'start' ? 'bottom' : 'left'
    case 'top-left':
      return endpoint === 'start' ? 'left' : 'top'
  }
}
