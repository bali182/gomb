import { POSITION_EPSILON } from '../constants/layout'
import type { PathSchema, PointSchema } from '../schemas/geometry'
import { narrowers } from '../utils/narrowers'
import { getPathSegments } from './pathSegments'
import type { ArcPathSegment, PathSegment } from './pathSegmentTypes'
import { isPointOnPathSegment } from './pathSegmentUtils'

export const isPointInClosedPath = (point: PointSchema, path: PathSchema): boolean => {
  const segments = getPathSegments(path, true)

  if (segments.some((segment) => isPointOnPathSegment(point, segment))) {
    return true
  }

  const intersections = getHorizontalRayIntersections(point, segments)

  return intersections.filter((intersection) => intersection.x.isGreaterThan(point.x)).length % 2 === 1
}

const getHorizontalRayIntersections = (point: PointSchema, segments: PathSegment[]): PointSchema[] => {
  const intersections = segments.flatMap((segment) => {
    if (narrowers.path.is.lineSegment(segment)) {
      return getLineRayIntersections(point, segment.start, segment.end)
    }

    return getArcRayIntersections(point, segment)
  })

  // Adjacent arcs can report slightly different coordinates for the same crossing.
  return intersections.filter((intersection, index) => {
    return !intersections
      .slice(0, index)
      .some((previous) => previous.x.minus(intersection.x).abs().isLessThanOrEqualTo(POSITION_EPSILON))
  })
}

const getLineRayIntersections = (point: PointSchema, start: PointSchema, end: PointSchema): PointSchema[] => {
  const startsAbove = start.y.isGreaterThan(point.y)
  const endsAbove = end.y.isGreaterThan(point.y)

  if (startsAbove === endsAbove) {
    return []
  }

  const progress = point.y.minus(start.y).dividedBy(end.y.minus(start.y))

  return [
    {
      x: start.x.plus(end.x.minus(start.x).times(progress)),
      y: point.y,
    },
  ]
}

const getArcRayIntersections = (point: PointSchema, arc: ArcPathSegment): PointSchema[] => {
  const verticalDistance = point.y.minus(arc.center.y)
  const horizontalDistanceSquared = arc.radius.pow(2).minus(verticalDistance.pow(2))

  if (horizontalDistanceSquared.isNegative()) {
    return []
  }

  const horizontalDistance = horizontalDistanceSquared.sqrt()
  const candidates: PointSchema[] = [
    { x: arc.center.x.minus(horizontalDistance), y: point.y },
    { x: arc.center.x.plus(horizontalDistance), y: point.y },
  ]

  return candidates.filter((candidate) => isPointOnPathSegment(candidate, arc))
}
