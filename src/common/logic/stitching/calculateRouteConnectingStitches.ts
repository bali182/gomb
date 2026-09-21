import type {
  ComputedStitchHoleSchema,
  ComputedStitchRouteDisconnectedCornerSchema,
  ComputedStitchRouteSchema,
  ComputedStitchSchema,
} from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema, StitchCornerSchema } from '../../schemas/stitching'
import { arePointsEqual } from '../../utils/arePointsEqual'
import { isDefined } from '../../utils/isDefined'

const STITCH_CORNERS: StitchCornerSchema[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

export const calculateRouteConnectingStitches = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  routes: ComputedStitchRouteSchema[],
): ComputedStitchSchema[] => {
  return [
    ...calculatePairedRouteConnectingStitches(stitchLine, routes),
    ...calculateSingleRouteConnectingStitches(stitchLine, routes),
  ]
}

const calculatePairedRouteConnectingStitches = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  routes: ComputedStitchRouteSchema[],
): ComputedStitchSchema[] => {
  return STITCH_CORNERS.flatMap((corner): ComputedStitchSchema[] => {
    if (!isStitchDisconnectedCornerEnabled(stitchLine, corner)) {
      return []
    }

    const disconnectedCornerRoutes = routes.filter((route) => isDefined(route.disconnectedCorners[corner]))
    const firstRoute = disconnectedCornerRoutes[0]
    const secondRoute = disconnectedCornerRoutes[1]

    if (!isDefined(firstRoute) || !isDefined(secondRoute) || disconnectedCornerRoutes.length !== 2) {
      return []
    }

    const firstPoint = getRouteDisconnectedCornerFreePoint(firstRoute, corner)
    const secondPoint = getRouteDisconnectedCornerFreePoint(secondRoute, corner)

    if (!isDefined(firstPoint) || !isDefined(secondPoint)) {
      return []
    }

    const stitch: ComputedStitchSchema = { line: { start: firstPoint, end: secondPoint } }
    return [stitch]
  })
}

const calculateSingleRouteConnectingStitches = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  routes: ComputedStitchRouteSchema[],
): ComputedStitchSchema[] => {
  const route = routes[0]
  if (
    routes.length !== 1 ||
    !isDefined(route) ||
    route.isClosed ||
    !stitchLine.top ||
    !stitchLine.right ||
    !stitchLine.bottom ||
    !stitchLine.left ||
    route.holes.length < 2
  ) {
    return []
  }

  const hasEnabledDisconnectedCorner = STITCH_CORNERS.some(
    (corner) => isStitchDisconnectedCornerEnabled(stitchLine, corner) && isDefined(route.disconnectedCorners[corner]),
  )
  if (!hasEnabledDisconnectedCorner) {
    return []
  }

  const firstHole = route.holes[0]
  const lastHole = route.holes[route.holes.length - 1]
  if (!isDefined(firstHole) || !isDefined(lastHole)) {
    return []
  }

  const firstStitch = getRouteEndpointStitch(route, firstHole)
  const lastStitch = getRouteEndpointStitch(route, lastHole)
  if (!isDefined(firstStitch) || !isDefined(lastStitch)) {
    return []
  }

  const stitch: ComputedStitchSchema = {
    line: {
      start: getUnusedStitchHolePoint(firstHole, firstStitch),
      end: getUnusedStitchHolePoint(lastHole, lastStitch),
    },
  }

  return [stitch]
}

const isStitchDisconnectedCornerEnabled = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  corner: StitchCornerSchema,
): boolean => {
  switch (corner) {
    case 'top-left':
      return stitchLine.stitchDisconnectedTopLeftCorner
    case 'top-right':
      return stitchLine.stitchDisconnectedTopRightCorner
    case 'bottom-right':
      return stitchLine.stitchDisconnectedBottomRightCorner
    case 'bottom-left':
      return stitchLine.stitchDisconnectedBottomLeftCorner
  }
}

const getRouteDisconnectedCornerFreePoint = (
  route: ComputedStitchRouteSchema,
  corner: StitchCornerSchema,
): PointSchema | undefined => {
  const disconnectedCorner = route.disconnectedCorners[corner]
  if (!isDefined(disconnectedCorner)) {
    return undefined
  }

  const normalStitch = getRouteEndpointStitch(route, disconnectedCorner.hole)
  return isDefined(normalStitch)
    ? getUnusedStitchHolePoint(disconnectedCorner.hole, normalStitch)
    : getCornerFacingStitchHolePoint(corner, disconnectedCorner)
}

const getRouteEndpointStitch = (
  route: ComputedStitchRouteSchema,
  hole: ComputedStitchHoleSchema,
): ComputedStitchSchema | undefined => {
  const firstAndLastStitches = [route.stitches[0], route.stitches[route.stitches.length - 1]]

  return firstAndLastStitches.find(
    (stitch): stitch is ComputedStitchSchema => isDefined(stitch) && isStitchConnectedToHole(stitch, hole),
  )
}

const isStitchConnectedToHole = (stitch: ComputedStitchSchema, hole: ComputedStitchHoleSchema): boolean => {
  return (
    arePointsEqual(stitch.line.start, hole.line.start) ||
    arePointsEqual(stitch.line.start, hole.line.end) ||
    arePointsEqual(stitch.line.end, hole.line.start) ||
    arePointsEqual(stitch.line.end, hole.line.end)
  )
}

const getUnusedStitchHolePoint = (hole: ComputedStitchHoleSchema, stitch: ComputedStitchSchema): PointSchema => {
  const usesLineStart =
    arePointsEqual(stitch.line.start, hole.line.start) || arePointsEqual(stitch.line.end, hole.line.start)
  return usesLineStart ? hole.line.end : hole.line.start
}

const getCornerFacingStitchHolePoint = (
  corner: StitchCornerSchema,
  disconnectedCorner: ComputedStitchRouteDisconnectedCornerSchema,
): PointSchema | undefined => {
  const { start, end } = disconnectedCorner.hole.line

  switch (corner) {
    case 'top-left':
      switch (disconnectedCorner.side) {
        case 'top':
          return start.x.isLessThanOrEqualTo(end.x) ? start : end
        case 'left':
          return start.y.isLessThanOrEqualTo(end.y) ? start : end
        default:
          return undefined
      }
    case 'top-right':
      switch (disconnectedCorner.side) {
        case 'top':
          return start.x.isGreaterThanOrEqualTo(end.x) ? start : end
        case 'right':
          return start.y.isLessThanOrEqualTo(end.y) ? start : end
        default:
          return undefined
      }
    case 'bottom-right':
      switch (disconnectedCorner.side) {
        case 'right':
          return start.y.isGreaterThanOrEqualTo(end.y) ? start : end
        case 'bottom':
          return start.x.isGreaterThanOrEqualTo(end.x) ? start : end
        default:
          return undefined
      }
    case 'bottom-left':
      switch (disconnectedCorner.side) {
        case 'bottom':
          return start.x.isLessThanOrEqualTo(end.x) ? start : end
        case 'left':
          return start.y.isGreaterThanOrEqualTo(end.y) ? start : end
        default:
          return undefined
      }
  }
}
