import BigNumber from 'bignumber.js'
import type { BooleanOp, PlineIntersectVisitContext, PlineSegIntr, Vector2 } from 'cavalier-contours-js'
import {
  FUZZY_EPSILON,
  plineSegIntr,
  PlineVertex,
  Polyline,
  segArcRadiusAndCenter,
  segMidpoint,
  segSplitAtPoint,
  segTangentVector,
} from 'cavalier-contours-js'

import type { PathCommand, PathSchema, PointSchema } from '../schemas/geometry'
import { isDefined } from '../utils/isDefined'
import { getClosedPathLoops } from './pathSegments'
import type { PathSegment } from './pathSegmentTypes'

type BooleanOperation = Exclude<BooleanOp, 'xor'>
type BooleanOperand = 'first' | 'second'

type Contour = {
  polyline: Polyline
  operand: BooleanOperand
  splitPoints: Vector2[][]
}

type ContourEdge = {
  start: PlineVertex
  end: PlineVertex
  contour: Contour
}

type BoundarySides = {
  left: boolean
  right: boolean
}

// Use the same precision as the library's geometric primitives, including winding calculations.
const POSITION_EPSILON = FUZZY_EPSILON
const AREA_EPSILON = POSITION_EPSILON * POSITION_EPSILON
const FULL_TURN = 2 * Math.PI

/**
 * Keeps the geometry library behind PathSchema-only operations.
 * A path may contain islands and holes, while the library's boolean API accepts one contour per operand.
 * All paths, including several outlines or holes, follow the same three steps:
 * split at intersections, retain the result boundary, then connect it into closed contours.
 * All intermediate types and library calls stay private to this file. Arcs are never approximated by lines.
 */
export const unionClosedPaths = (first: PathSchema, others: readonly PathSchema[]): PathSchema => {
  if (others.length === 0) {
    return first
  }

  return fromPolylines(
    others.reduce<Polyline[]>((result, path) => calculateBoolean(result, toPolylines(path), 'or'), toPolylines(first)),
  )
}

export const subtractClosedPaths = (subject: PathSchema, holes: readonly PathSchema[]): PathSchema => {
  if (holes.length === 0) {
    return subject
  }

  return fromPolylines(
    holes.reduce<Polyline[]>(
      (result, hole) => calculateBoolean(result, toPolylines(hole), 'not'),
      toPolylines(subject),
    ),
  )
}

export const intersectClosedPaths = (first: PathSchema, second: PathSchema): PathSchema => {
  return fromPolylines(calculateBoolean(toPolylines(first), toPolylines(second), 'and'))
}

export const isClosedPathCoveredBy = (path: PathSchema, coveringPath: PathSchema): boolean => {
  return calculateBoolean(toPolylines(path), toPolylines(coveringPath), 'not').length === 0
}

const calculateBoolean = (first: Polyline[], second: Polyline[], operation: BooleanOperation): Polyline[] => {
  if (first.length === 0) {
    return operation === 'or' ? second : []
  }

  if (second.length === 0) {
    return operation === 'and' ? [] : first
  }

  return calculateCompoundBoolean(first, second, operation)
}

/** The three stages below operate on complete paths, so holes participate in the same operation as outlines. */
const calculateCompoundBoolean = (first: Polyline[], second: Polyline[], operation: BooleanOperation): Polyline[] => {
  const contours = [
    ...first.map((polyline) => createContour(polyline, 'first')),
    ...second.map((polyline) => createContour(polyline, 'second')),
  ]

  // After splitting, each piece is wholly inside, outside, or shared with the other contours.
  collectIntersections(contours)
  const edges = contours.flatMap(splitContour)

  // Keep only pieces with material on one side and empty space on the other in the requested result.
  const boundary = selectBoundaryEdges(edges, contours, operation)

  // Each retained piece has material on its left. Joining their endpoints produces outlines and holes.
  return connectBoundaryEdges(boundary)
}

const createContour = (polyline: Polyline, operand: BooleanOperand): Contour => ({
  polyline,
  operand,
  splitPoints: Array.from({ length: polyline.vertexCount }, (): Vector2[] => []),
})

const collectIntersections = (contours: Contour[]): void => {
  for (let firstIndex = 0; firstIndex < contours.length; firstIndex += 1) {
    const first = contours[firstIndex]
    for (let secondIndex = firstIndex + 1; secondIndex < contours.length; secondIndex += 1) {
      const second = contours[secondIndex]
      // Use raw segment intersections. findIntersectsOpt suppresses near-endpoint hits, assuming the
      // adjacent segment reports them, which can omit an intersection when two contours nearly touch.
      first.polyline.visitIntersectsOpt(
        second.polyline,
        (
          intersection: PlineSegIntr,
          firstSegment: PlineIntersectVisitContext,
          secondSegment: PlineIntersectVisitContext,
        ): void => {
          const points = getIntersectionPoints(intersection).filter(
            (point) => isWithinSegment(point, firstSegment) && isWithinSegment(point, secondSegment),
          )
          first.splitPoints[firstSegment.vertexIndex].push(...points)
          second.splitPoints[secondSegment.vertexIndex].push(...points)
        },
        { posEqualEps: POSITION_EPSILON },
      )
    }
  }
}

const isWithinSegment = (point: Vector2, segment: PlineIntersectVisitContext): boolean => {
  if (!segment.v1.bulgeIsZero()) {
    return true
  }
  // The library also reports intersections just beyond line endpoints within its position tolerance.
  // Those are intersections of the extended lines, not of our actual boundary segments.
  const direction = segment.v2.pos().sub(segment.v1.pos())
  const projection = point.sub(segment.v1.pos()).dot(direction)
  return projection >= 0 && projection <= direction.lengthSquared()
}

const getIntersectionPoints = (intersection: PlineSegIntr): Vector2[] => {
  switch (intersection.kind) {
    case 'noIntersect':
      return []
    case 'oneIntersect':
    case 'tangentIntersect':
      return [intersection.point]
    case 'twoIntersects':
    case 'overlappingLines':
    case 'overlappingArcs':
      return [intersection.point1, intersection.point2]
  }
}

const splitContour = (contour: Contour): ContourEdge[] => {
  const edges: ContourEdge[] = []

  for (const [startIndex, endIndex] of contour.polyline.iterSegmentIndexes()) {
    const start = contour.polyline.at(startIndex)
    const end = contour.polyline.at(endIndex)
    const points = contour.splitPoints[startIndex].sort(
      (first, second) => first.sub(start.pos()).lengthSquared() - second.sub(start.pos()).lengthSquared(),
    )
    let current = start

    for (const point of points) {
      if (arePositionsEqual(point, current.pos()) || arePositionsEqual(point, end.pos())) {
        continue
      }
      // Keep even very short pieces between distinct intersections. Dropping one would open the boundary.
      // Zero disables the library's near-endpoint collapse, exact duplicates have already been excluded.
      const split = segSplitAtPoint(current, end, point, 0)
      edges.push({ start: split.updatedStart, end: split.splitVertex, contour })
      current = split.splitVertex
    }

    if (!arePositionsEqual(current.pos(), end.pos())) {
      edges.push({ start: current, end, contour })
    }
  }

  return edges
}

const selectBoundaryEdges = (edges: ContourEdge[], contours: Contour[], operation: BooleanOperation): ContourEdge[] => {
  const boundary: ContourEdge[] = []

  for (const edge of edges) {
    const point = segMidpoint(edge.start, edge.end)
    const tangent = segTangentVector(edge.start, edge.end, point)
    const first = getFilledSides(edge, contours, 'first', point, tangent)
    const second = getFilledSides(edge, contours, 'second', point, tangent)
    const left = isResultFilled(first.left, second.left, operation)
    const right = isResultFilled(first.right, second.right, operation)

    if (left === right) {
      continue
    }

    // Orient every retained edge with material on its left, including hole boundaries.
    const selected = left ? edge : reverseEdge(edge)
    if (!boundary.some((existing) => areEdgesEqual(existing, selected))) {
      boundary.push(selected)
    }
  }

  return boundary
}

/**
 * SVG's non-zero fill rule adds +1 inside a counterclockwise contour and -1 inside a clockwise contour.
 * A non-zero total means material. Opposite hole winding cancels the surrounding outline's contribution.
 * At a shared boundary we count the two sides separately, without moving or sampling across a narrow gap.
 */
const getFilledSides = (
  edge: ContourEdge,
  contours: Contour[],
  operand: BooleanOperand,
  point: Vector2,
  tangent: Vector2,
): BoundarySides => {
  let leftWinding = 0
  let rightWinding = 0

  for (const contour of contours) {
    if (contour.operand !== operand) {
      continue
    }
    const sharedTangent = getSharedBoundaryTangent(edge, contour, point)
    if (!isDefined(sharedTangent)) {
      // This piece does not run along the contour, so that contour contributes equally on both sides.
      const winding = contour.polyline.windingNumber(point)
      leftWinding += winding
      rightWinding += winding
      continue
    }

    // Along a contour, only its interior side contributes to the winding total.
    const winding = contour.polyline.area() > 0 ? 1 : -1
    const sameDirection = sharedTangent.dot(tangent) > 0
    const interiorIsOnLeft = winding > 0 === sameDirection
    if (interiorIsOnLeft) {
      leftWinding += winding
    } else {
      rightWinding += winding
    }
  }

  return { left: leftWinding !== 0, right: rightWinding !== 0 }
}

/** Only an overlapping segment is a shared boundary. Being within the position tolerance is insufficient. */
const getSharedBoundaryTangent = (edge: ContourEdge, contour: Contour, point: Vector2): Vector2 | undefined => {
  if (edge.contour === contour) {
    return segTangentVector(edge.start, edge.end, point)
  }

  for (const [startIndex, endIndex] of contour.polyline.iterSegmentIndexes()) {
    const start = contour.polyline.at(startIndex)
    const end = contour.polyline.at(endIndex)
    const intersection = plineSegIntr(edge.start, edge.end, start, end, POSITION_EPSILON)
    if (intersection.kind !== 'overlappingLines' && intersection.kind !== 'overlappingArcs') {
      continue
    }

    // Splitting at all intersection endpoints makes a shared piece coincide with the whole overlap.
    const forward =
      edge.start.pos().fuzzyEqEps(intersection.point1, POSITION_EPSILON) &&
      edge.end.pos().fuzzyEqEps(intersection.point2, POSITION_EPSILON)
    const backward =
      edge.start.pos().fuzzyEqEps(intersection.point2, POSITION_EPSILON) &&
      edge.end.pos().fuzzyEqEps(intersection.point1, POSITION_EPSILON)
    if (forward || backward) {
      return segTangentVector(start, end, point)
    }
  }

  return undefined
}

const isResultFilled = (first: boolean, second: boolean, operation: BooleanOperation): boolean => {
  switch (operation) {
    case 'or':
      return first || second
    case 'and':
      return first && second
    case 'not':
      return first && !second
  }
}

const reverseEdge = (edge: ContourEdge): ContourEdge => ({
  start: new PlineVertex(edge.end.x, edge.end.y, -edge.start.bulge),
  end: edge.start,
  contour: edge.contour,
})

const areEdgesEqual = (first: ContourEdge, second: ContourEdge): boolean => {
  const intersection = plineSegIntr(first.start, first.end, second.start, second.end, POSITION_EPSILON)
  return (
    (intersection.kind === 'overlappingLines' || intersection.kind === 'overlappingArcs') &&
    first.start.pos().fuzzyEqEps(second.start.pos(), POSITION_EPSILON) &&
    first.end.pos().fuzzyEqEps(second.end.pos(), POSITION_EPSILON) &&
    segMidpoint(first.start, first.end).fuzzyEqEps(segMidpoint(second.start, second.end), POSITION_EPSILON)
  )
}

const connectBoundaryEdges = (edges: ContourEdge[]): Polyline[] => {
  const remaining = new Set(edges)
  const polylines: Polyline[] = []

  for (const first of edges) {
    if (!remaining.has(first)) {
      continue
    }
    const polyline = new Polyline({ isClosed: true })
    let current = first

    for (;;) {
      remaining.delete(current)
      polyline.addVertex(current.start)
      if (
        arePositionsEqual(current.end.pos(), first.start.pos()) ||
        (current.end.pos().fuzzyEqEps(first.start.pos(), POSITION_EPSILON) && !hasExactContinuation(current, remaining))
      ) {
        break
      }
      current = getNextBoundaryEdge(current, remaining)
    }

    if (Math.abs(polyline.area()) >= AREA_EPSILON) {
      polylines.push(polyline)
    }
  }

  return polylines
}

const getNextBoundaryEdge = (current: ContourEdge, remaining: Set<ContourEdge>): ContourEdge => {
  const incoming = segTangentVector(current.start, current.end, current.end.pos())
  const reverseAngle = Math.atan2(-incoming.y, -incoming.x)
  const exactContinuation = hasExactContinuation(current, remaining)
  let next: ContourEdge | undefined
  let smallestTurn = Infinity

  for (const candidate of remaining) {
    const connected = exactContinuation
      ? arePositionsEqual(current.end.pos(), candidate.start.pos())
      : current.end.pos().fuzzyEqEps(candidate.start.pos(), POSITION_EPSILON)
    if (!connected) {
      continue
    }
    const outgoing = segTangentVector(candidate.start, candidate.end, candidate.start.pos())
    const turn = (reverseAngle - Math.atan2(outgoing.y, outgoing.x) + FULL_TURN) % FULL_TURN

    // Follow the face with material on its left. At a tangency prefer the original contour.
    if (turn < smallestTurn || (turn === smallestTurn && candidate.contour === current.contour)) {
      next = candidate
      smallestTurn = turn
    }
  }

  if (!isDefined(next)) {
    throw new Error('Boolean path boundary is not closed')
  }
  return next
}

// Prefer the actual endpoint over a merely nearby one, otherwise a narrow gap could connect separate contours.
const hasExactContinuation = (edge: ContourEdge, remaining: Set<ContourEdge>): boolean => {
  for (const candidate of remaining) {
    if (arePositionsEqual(edge.end.pos(), candidate.start.pos())) {
      return true
    }
  }
  return false
}

const arePositionsEqual = (first: Vector2, second: Vector2): boolean => {
  return first.x === second.x && first.y === second.y
}

const toPolylines = (path: PathSchema): Polyline[] => {
  return getClosedPathLoops(path)
    .map((segments) => Polyline.fromVertexes(segments.map(toPolylineVertex), true))
    .filter((polyline) => polyline.vertexCount >= 2 && Math.abs(polyline.area()) >= AREA_EPSILON)
}

const toPolylineVertex = (segment: PathSegment): PlineVertex => {
  return new PlineVertex(
    segment.start.x.toNumber(),
    segment.start.y.toNumber(),
    segment.type === 'arc' ? Math.tan(segment.sweepAngle / 4) : 0,
  )
}

const fromPolylines = (polylines: Polyline[]): PathSchema => ({
  commands: polylines.flatMap(getPolylineCommands),
})

const getPolylineCommands = (polyline: Polyline): PathCommand[] => {
  const startPoint = toPathPoint(polyline.at(0).pos())
  const commands: PathCommand[] = [{ type: 'moveTo', point: startPoint }]

  for (const [startIndex, endIndex] of polyline.iterSegmentIndexes()) {
    const start = polyline.at(startIndex)
    const end = polyline.at(endIndex)
    const endpoint = endIndex === 0 ? startPoint : toPathPoint(end.pos())

    if (start.bulgeIsZero()) {
      commands.push({ type: 'lineTo', point: endpoint })
      continue
    }

    commands.push(...getArcCommands(start, end, endpoint))
  }

  commands.push({ type: 'close' })
  return commands
}

const getArcCommands = (start: PlineVertex, end: PlineVertex, endpoint: PointSchema): PathCommand[] => {
  const [radius, center] = segArcRadiusAndCenter(start, end)
  const sweep = 4 * Math.atan(start.bulge)
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  // Quarter-circle pieces avoid diameter-rounding ambiguity in our small-sweep arc commands.
  const count = Math.ceil(Math.abs(sweep) / (Math.PI / 2))

  return Array.from({ length: count }, (_, index): PathCommand => {
    const angle = startAngle + (sweep * (index + 1)) / count
    return {
      type: 'arcTo',
      radius: new BigNumber(radius),
      reversed: start.bulge < 0,
      point:
        index === count - 1
          ? endpoint
          : {
              x: new BigNumber(center.x + radius * Math.cos(angle)),
              y: new BigNumber(center.y + radius * Math.sin(angle)),
            },
    }
  })
}

const toPathPoint = (point: Vector2): PointSchema => ({
  x: new BigNumber(point.x),
  y: new BigNumber(point.y),
})
