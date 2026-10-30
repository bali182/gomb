import BigNumber from 'bignumber.js'
import { narrowers } from '../utils/narrowers'

import { TWO } from '../constants/layout'
import type { PointSchema } from '../schemas/geometry'
import type { ArcPathSegment, LinePathSegment, PathSegment, PathSegmentIntersection } from './pathSegmentTypes'
import {
  getAngle,
  getArcProgress,
  getPointOnPathSegment,
  getSortedDistinctProgresses,
  isProgressInRange,
} from './pathSegmentUtils'

export const getPathSegmentIntersections = (first: PathSegment, second: PathSegment): PathSegmentIntersection[] => {
  if (narrowers.path.is.lineSegment(first) && narrowers.path.is.lineSegment(second)) {
    return getLineLineIntersections(first, second)
  }

  if (narrowers.path.is.lineSegment(first) && narrowers.path.is.arcSegment(second)) {
    return getLineArcIntersections(first, second)
  }

  if (narrowers.path.is.arcSegment(first) && narrowers.path.is.lineSegment(second)) {
    return getLineArcIntersections(second, first).map((intersection) => ({
      firstProgress: intersection.secondProgress,
      secondProgress: intersection.firstProgress,
      point: intersection.point,
    }))
  }

  if (narrowers.path.is.arcSegment(first) && narrowers.path.is.arcSegment(second)) {
    return getArcArcIntersections(first, second)
  }

  throw new Error('Unsupported path segment intersection')
}

export type RayPathSegmentIntersection = {
  rayProgress: BigNumber
  segmentProgress: BigNumber
  point: PointSchema
}

export const getRayPathSegmentIntersections = (
  origin: PointSchema,
  direction: PointSchema,
  segment: PathSegment,
): RayPathSegmentIntersection[] => {
  if (narrowers.path.is.lineSegment(segment)) {
    return getRayLineIntersections(origin, direction, segment)
  }

  return getRayArcIntersections(origin, direction, segment)
}

const getRayLineIntersections = (
  origin: PointSchema,
  direction: PointSchema,
  line: LinePathSegment,
): RayPathSegmentIntersection[] => {
  const lineX = line.end.x.minus(line.start.x)
  const lineY = line.end.y.minus(line.start.y)
  const denominator = direction.x.times(lineY).minus(direction.y.times(lineX))

  if (denominator.isZero()) {
    return []
  }

  const originX = line.start.x.minus(origin.x)
  const originY = line.start.y.minus(origin.y)
  const rayProgress = originX.times(lineY).minus(originY.times(lineX)).dividedBy(denominator)
  const segmentProgress = originX.times(direction.y).minus(originY.times(direction.x)).dividedBy(denominator)

  if (!rayProgress.isGreaterThan(0) || !isProgressInRange(segmentProgress)) {
    return []
  }

  return [{ rayProgress, segmentProgress, point: getPointOnPathSegment(line, segmentProgress) }]
}

const getRayArcIntersections = (
  origin: PointSchema,
  direction: PointSchema,
  arc: ArcPathSegment,
): RayPathSegmentIntersection[] => {
  const originX = origin.x.minus(arc.center.x)
  const originY = origin.y.minus(arc.center.y)
  const directionLengthSquared = direction.x.pow(2).plus(direction.y.pow(2))

  if (directionLengthSquared.isZero()) {
    return []
  }

  const a = directionLengthSquared
  const b = TWO.times(originX.times(direction.x).plus(originY.times(direction.y)))
  const c = originX.pow(2).plus(originY.pow(2)).minus(arc.radius.pow(2))
  const discriminant = b.pow(2).minus(new BigNumber(4).times(a).times(c))

  if (discriminant.isNegative()) {
    return []
  }

  const discriminantRoot = discriminant.sqrt()
  const progresses = [
    b.negated().minus(discriminantRoot).dividedBy(TWO.times(a)),
    b.negated().plus(discriminantRoot).dividedBy(TWO.times(a)),
  ]

  return progresses.flatMap((rayProgress, index): RayPathSegmentIntersection[] => {
    if ((index === 1 && rayProgress.isEqualTo(progresses[0])) || !rayProgress.isGreaterThan(0)) {
      return []
    }

    const point = getRayPoint(origin, direction, rayProgress)
    const segmentProgress = new BigNumber(getArcProgress(arc, getAngle(arc.center, point)))

    return isProgressInRange(segmentProgress) ? [{ rayProgress, segmentProgress, point }] : []
  })
}

const getRayPoint = (origin: PointSchema, direction: PointSchema, progress: BigNumber): PointSchema => ({
  x: origin.x.plus(direction.x.times(progress)),
  y: origin.y.plus(direction.y.times(progress)),
})

const getLineLineIntersections = (first: LinePathSegment, second: LinePathSegment): PathSegmentIntersection[] => {
  const firstDx = first.end.x.minus(first.start.x)
  const firstDy = first.end.y.minus(first.start.y)
  const secondDx = second.end.x.minus(second.start.x)
  const secondDy = second.end.y.minus(second.start.y)
  const denominator = firstDx.times(secondDy).minus(firstDy.times(secondDx))

  if (denominator.isZero()) {
    return []
  }

  const startDx = second.start.x.minus(first.start.x)
  const startDy = second.start.y.minus(first.start.y)
  const firstProgress = startDx.times(secondDy).minus(startDy.times(secondDx)).dividedBy(denominator)
  const secondProgress = startDx.times(firstDy).minus(startDy.times(firstDx)).dividedBy(denominator)

  if (!isProgressInRange(firstProgress) || !isProgressInRange(secondProgress)) {
    return []
  }

  return [{ firstProgress, secondProgress, point: getPointOnPathSegment(first, firstProgress) }]
}

const getLineArcIntersections = (line: LinePathSegment, arc: ArcPathSegment): PathSegmentIntersection[] => {
  const dx = line.end.x.minus(line.start.x)
  const dy = line.end.y.minus(line.start.y)
  const fromCenterX = line.start.x.minus(arc.center.x)
  const fromCenterY = line.start.y.minus(arc.center.y)
  const a = dx.pow(2).plus(dy.pow(2))
  const b = TWO.times(fromCenterX.times(dx).plus(fromCenterY.times(dy)))
  const c = fromCenterX.pow(2).plus(fromCenterY.pow(2)).minus(arc.radius.pow(2))
  const discriminant = b.pow(2).minus(new BigNumber(4).times(a).times(c))

  if (discriminant.isNegative()) {
    return []
  }

  const discriminantRoot = discriminant.sqrt()
  const firstProgress = b.negated().minus(discriminantRoot).dividedBy(TWO.times(a))
  const secondProgress = b.negated().plus(discriminantRoot).dividedBy(TWO.times(a))

  return getSortedDistinctProgresses([firstProgress, secondProgress]).flatMap((lineProgress) => {
    if (!isProgressInRange(lineProgress)) {
      return []
    }

    const point = getPointOnPathSegment(line, lineProgress)
    const arcProgress = new BigNumber(getArcProgress(arc, getAngle(arc.center, point)))

    if (!isProgressInRange(arcProgress)) {
      return []
    }

    return [{ firstProgress: lineProgress, secondProgress: arcProgress, point }]
  })
}

const getArcArcIntersections = (first: ArcPathSegment, second: ArcPathSegment): PathSegmentIntersection[] => {
  const centerDx = second.center.x.minus(first.center.x)
  const centerDy = second.center.y.minus(first.center.y)
  const centerDistance = centerDx.pow(2).plus(centerDy.pow(2)).sqrt()

  if (centerDistance.isZero() || centerDistance.isGreaterThan(first.radius.plus(second.radius))) {
    return []
  }

  if (centerDistance.isLessThan(first.radius.minus(second.radius).abs())) {
    return []
  }

  const firstDistance = first.radius
    .pow(2)
    .minus(second.radius.pow(2))
    .plus(centerDistance.pow(2))
    .dividedBy(TWO.times(centerDistance))
  const heightSquared = first.radius.pow(2).minus(firstDistance.pow(2))

  if (heightSquared.isNegative()) {
    return []
  }

  const height = heightSquared.sqrt()
  const baseX = first.center.x.plus(centerDx.dividedBy(centerDistance).times(firstDistance))
  const baseY = first.center.y.plus(centerDy.dividedBy(centerDistance).times(firstDistance))
  const offsetX = centerDy.negated().dividedBy(centerDistance).times(height)
  const offsetY = centerDx.dividedBy(centerDistance).times(height)
  const firstPoint: PointSchema = { x: baseX.plus(offsetX), y: baseY.plus(offsetY) }
  const secondPoint: PointSchema = { x: baseX.minus(offsetX), y: baseY.minus(offsetY) }

  return [firstPoint, secondPoint].flatMap((point) => {
    const firstProgress = new BigNumber(getArcProgress(first, getAngle(first.center, point)))
    const secondProgress = new BigNumber(getArcProgress(second, getAngle(second.center, point)))

    if (!isProgressInRange(firstProgress) || !isProgressInRange(secondProgress)) {
      return []
    }

    return [{ firstProgress, secondProgress, point }]
  })
}
