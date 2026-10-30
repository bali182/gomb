import BigNumber from 'bignumber.js'
import { narrowers } from '../utils/narrowers'

import { POSITION_EPSILON, TWO, ZERO } from '../constants/layout'
import type { PathArcToSchema, PointSchema } from '../schemas/geometry'
import type { ArcPathSegment, LinePathSegment, PathSegment } from './pathSegmentTypes'

const TWO_PI = Math.PI * 2

export const createArcPathSegment = (start: PointSchema, command: PathArcToSchema): ArcPathSegment => {
  const chordDx = command.point.x.minus(start.x)
  const chordDy = command.point.y.minus(start.y)
  const chordLength = chordDx.pow(2).plus(chordDy.pow(2)).sqrt()

  if (chordLength.isZero()) {
    throw new Error('Arc start and end points must differ')
  }

  if (chordLength.isGreaterThan(command.radius.times(TWO))) {
    throw new Error('Arc radius is too small for its endpoints')
  }

  const midpoint: PointSchema = {
    x: start.x.plus(command.point.x).dividedBy(TWO),
    y: start.y.plus(command.point.y).dividedBy(TWO),
  }
  const perpendicularLength = command.radius.pow(2).minus(chordLength.dividedBy(TWO).pow(2)).sqrt()
  const perpendicularX = chordDy.negated().dividedBy(chordLength).times(perpendicularLength)
  const perpendicularY = chordDx.dividedBy(chordLength).times(perpendicularLength)
  const firstCenter: PointSchema = {
    x: midpoint.x.plus(perpendicularX),
    y: midpoint.y.plus(perpendicularY),
  }
  const secondCenter: PointSchema = {
    x: midpoint.x.minus(perpendicularX),
    y: midpoint.y.minus(perpendicularY),
  }
  const center = command.reversed
    ? getSweepZeroCenter(start, command.point, firstCenter, secondCenter)
    : getSweepOneCenter(start, command.point, firstCenter, secondCenter)
  const startAngle = getAngle(center, start)
  const endAngle = getAngle(center, command.point)
  const sweepAngle = command.reversed
    ? -getPositiveAngleDifference(endAngle, startAngle)
    : getPositiveAngleDifference(startAngle, endAngle)

  if (Math.abs(sweepAngle) > Math.PI) {
    throw new Error('Arc path commands must use the small sweep')
  }

  return {
    type: 'arc',
    start,
    end: command.point,
    radius: command.radius,
    reversed: command.reversed,
    center,
    startAngle,
    sweepAngle,
  }
}

export const getPathSegmentMidpoint = (segment: PathSegment): PointSchema => {
  return getPointOnPathSegment(segment, new BigNumber(0.5))
}

export const getPointOnPathSegment = (segment: PathSegment, progress: BigNumber): PointSchema => {
  if (narrowers.path.is.lineSegment(segment)) {
    return {
      x: segment.start.x.plus(segment.end.x.minus(segment.start.x).times(progress)),
      y: segment.start.y.plus(segment.end.y.minus(segment.start.y).times(progress)),
    }
  }

  const angle = segment.startAngle + segment.sweepAngle * progress.toNumber()

  return {
    x: segment.center.x.plus(new BigNumber(Math.cos(angle)).times(segment.radius)),
    y: segment.center.y.plus(new BigNumber(Math.sin(angle)).times(segment.radius)),
  }
}

export const getPathSegmentTangent = (segment: PathSegment, point: PointSchema): PointSchema => {
  if (narrowers.path.is.lineSegment(segment)) {
    return {
      x: segment.end.x.minus(segment.start.x),
      y: segment.end.y.minus(segment.start.y),
    }
  }

  const radiusX = point.x.minus(segment.center.x)
  const radiusY = point.y.minus(segment.center.y)

  return segment.sweepAngle > 0 ? { x: radiusY.negated(), y: radiusX } : { x: radiusY, y: radiusX.negated() }
}

export const splitPathSegment = (segment: PathSegment, progresses: BigNumber[]): PathSegment[] => {
  const sortedProgresses = getSortedDistinctProgresses(progresses)
  const boundaries = [ZERO, ...sortedProgresses, new BigNumber(1)]
  const pieces: PathSegment[] = []

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const startProgress = boundaries[index]
    const endProgress = boundaries[index + 1]

    if (!startProgress.isEqualTo(endProgress)) {
      pieces.push(getPathSegmentRange(segment, startProgress, endProgress))
    }
  }

  return pieces
}

export const isPointOnPathSegment = (point: PointSchema, segment: PathSegment): boolean => {
  if (narrowers.path.is.lineSegment(segment)) {
    const dx = segment.end.x.minus(segment.start.x)
    const dy = segment.end.y.minus(segment.start.y)
    const pointDx = point.x.minus(segment.start.x)
    const pointDy = point.y.minus(segment.start.y)

    if (!dx.times(pointDy).minus(dy.times(pointDx)).isZero()) {
      return false
    }

    return (
      point.x.isGreaterThanOrEqualTo(BigNumber.minimum(segment.start.x, segment.end.x)) &&
      point.x.isLessThanOrEqualTo(BigNumber.maximum(segment.start.x, segment.end.x)) &&
      point.y.isGreaterThanOrEqualTo(BigNumber.minimum(segment.start.y, segment.end.y)) &&
      point.y.isLessThanOrEqualTo(BigNumber.maximum(segment.start.y, segment.end.y))
    )
  }

  const distanceSquared = point.x.minus(segment.center.x).pow(2).plus(point.y.minus(segment.center.y).pow(2))
  const minimumRadius = BigNumber.maximum(segment.radius.minus(POSITION_EPSILON), 0)
  const maximumRadius = segment.radius.plus(POSITION_EPSILON)

  return (
    distanceSquared.isGreaterThanOrEqualTo(minimumRadius.pow(2)) &&
    distanceSquared.isLessThanOrEqualTo(maximumRadius.pow(2)) &&
    isPointOnArc(point, segment)
  )
}

export const isPointOnArc = (point: PointSchema, arc: ArcPathSegment): boolean => {
  const progress = getArcProgress(arc, getAngle(arc.center, point))

  return progress >= 0 && progress <= 1
}

export const getArcProgress = (arc: ArcPathSegment, angle: number): number => {
  if (arc.sweepAngle >= 0) {
    return getPositiveAngleDifference(arc.startAngle, angle) / arc.sweepAngle
  }

  return getPositiveAngleDifference(angle, arc.startAngle) / -arc.sweepAngle
}

export const getAngle = (center: PointSchema, point: PointSchema): number => {
  return Math.atan2(point.y.minus(center.y).toNumber(), point.x.minus(center.x).toNumber())
}

export const getSortedDistinctProgresses = (progresses: BigNumber[]): BigNumber[] => {
  const sortedProgresses = progresses
    .filter((progress) => progress.isGreaterThan(ZERO) && progress.isLessThan(1))
    .sort((first, second) => first.comparedTo(second) ?? 0)

  return sortedProgresses.filter((progress, index) => index === 0 || !progress.isEqualTo(sortedProgresses[index - 1]))
}

export const isProgressInRange = (progress: BigNumber): boolean => {
  return progress.isGreaterThanOrEqualTo(ZERO) && progress.isLessThanOrEqualTo(1)
}

export const doLinePathSegmentsOverlap = (first: LinePathSegment, second: LinePathSegment): boolean => {
  const firstDx = first.end.x.minus(first.start.x)
  const firstDy = first.end.y.minus(first.start.y)
  const secondDx = second.end.x.minus(second.start.x)
  const secondDy = second.end.y.minus(second.start.y)

  if (
    (firstDx.isZero() && firstDy.isZero()) ||
    (secondDx.isZero() && secondDy.isZero()) ||
    !firstDx.times(secondDy).minus(firstDy.times(secondDx)).isZero()
  ) {
    return false
  }

  const startDx = second.start.x.minus(first.start.x)
  const startDy = second.start.y.minus(first.start.y)

  if (!firstDx.times(startDy).minus(firstDy.times(startDx)).isZero()) {
    return false
  }

  if (!firstDx.isZero()) {
    return doRangesOverlap(first.start.x, first.end.x, second.start.x, second.end.x)
  }

  return doRangesOverlap(first.start.y, first.end.y, second.start.y, second.end.y)
}

const getPathSegmentRange = (segment: PathSegment, startProgress: BigNumber, endProgress: BigNumber): PathSegment => {
  const start = getPointOnPathSegment(segment, startProgress)
  const end = getPointOnPathSegment(segment, endProgress)

  if (narrowers.path.is.lineSegment(segment)) {
    return { type: 'line', start, end }
  }

  return {
    ...segment,
    start,
    end,
    reversed: segment.reversed,
    startAngle: segment.startAngle + segment.sweepAngle * startProgress.toNumber(),
    sweepAngle: segment.sweepAngle * endProgress.minus(startProgress).toNumber(),
  }
}

const doRangesOverlap = (
  firstStart: BigNumber,
  firstEnd: BigNumber,
  secondStart: BigNumber,
  secondEnd: BigNumber,
): boolean => {
  const overlapStart = BigNumber.maximum(
    BigNumber.minimum(firstStart, firstEnd),
    BigNumber.minimum(secondStart, secondEnd),
  )
  const overlapEnd = BigNumber.minimum(
    BigNumber.maximum(firstStart, firstEnd),
    BigNumber.maximum(secondStart, secondEnd),
  )

  return overlapStart.isLessThan(overlapEnd)
}

const getSweepOneCenter = (
  start: PointSchema,
  end: PointSchema,
  first: PointSchema,
  second: PointSchema,
): PointSchema => {
  const firstStartAngle = getAngle(first, start)
  const firstEndAngle = getAngle(first, end)

  return getPositiveAngleDifference(firstStartAngle, firstEndAngle) <= Math.PI ? first : second
}

const getSweepZeroCenter = (
  start: PointSchema,
  end: PointSchema,
  first: PointSchema,
  second: PointSchema,
): PointSchema => {
  const firstStartAngle = getAngle(first, start)
  const firstEndAngle = getAngle(first, end)

  return getPositiveAngleDifference(firstEndAngle, firstStartAngle) <= Math.PI ? first : second
}

const getPositiveAngleDifference = (start: number, end: number): number => {
  const difference = (end - start) % TWO_PI

  return difference < 0 ? difference + TWO_PI : difference
}
