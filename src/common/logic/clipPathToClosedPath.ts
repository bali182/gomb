import type { PathSchema } from '../schemas/geometry'
import { isPointInClosedPath } from './isPointInClosedPath'
import { getPathSegmentIntersections } from './pathSegmentIntersections'
import { createPathsFromConnectedSegments, getPathSegments } from './pathSegments'
import { getPathSegmentMidpoint, splitPathSegment } from './pathSegmentUtils'

export const clipPathToClosedPath = (path: PathSchema, clippingPath: PathSchema): PathSchema[] => {
  if (clippingPath.commands.length === 0) {
    return []
  }
  const clippingSegments = getPathSegments(clippingPath, true)
  const segments = getPathSegments(path)
  const clippedSegments = segments.flatMap((segment) => {
    const progresses = clippingSegments.flatMap((clippingSegment) => {
      return getPathSegmentIntersections(segment, clippingSegment).map((intersection) => intersection.firstProgress)
    })

    return splitPathSegment(segment, progresses).filter((piece) => {
      return isPointInClosedPath(getPathSegmentMidpoint(piece), clippingPath)
    })
  })

  return createPathsFromConnectedSegments(clippedSegments)
}
