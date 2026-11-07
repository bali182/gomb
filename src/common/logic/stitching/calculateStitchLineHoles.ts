import BigNumber from 'bignumber.js'
import type { ComputedStitchHoleSchema, StitchCornerPathFragment, StitchPathFragment } from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { arePointsEqual } from '../../utils/arePointsEqual'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getPointDistance } from '../geometryUtils'
import type { CalculatedStitchLinePath } from './calculateStitchLinePaths'
import { getStitchHoleLine } from './getStitchHoleLine'
import {
  createStitchHoleSegments,
  findNextStitchHole,
  getSegmentTangentRotation,
  getStitchHoleRotation,
  type StitchHoleSegment,
} from './stitchHoleGeometry'

const MINIMUM_STITCH_HOLE_ENDPOINT_DISTANCE_FACTOR = new BigNumber(0.5)

type StitchHoleTraversal = {
  segments: StitchHoleSegment[]
  reversed: boolean
  startCorner: StitchCornerPathFragment | undefined
  endCorner: StitchCornerPathFragment | undefined
}

export const calculateStitchLineHoles = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  calculatedPath: CalculatedStitchLinePath,
): ComputedStitchHoleSchema[] => {
  const distance = new BigNumber(stitchLine.stitchHoleDistance)
  if (!distance.isGreaterThan(0)) {
    return []
  }
  const reversed = stitchLine.stitchDirection === 'end-to-start'
  const hasSharpCorner = calculatedPath.fragments.some(isSharpCorner)
  let traversals: StitchHoleTraversal[]
  if (hasSharpCorner) {
    traversals = calculateStitchHoleTraversals(calculatedPath, reversed)
  } else {
    let segments = createStitchHoleSegments(calculatedPath.fragments)
    if (calculatedPath.isClosed) {
      segments = shiftClosedSegments(segments, stitchLine.startOffset)
    }
    traversals = [
      {
        segments: reversed ? reverseSegments(segments) : segments,
        reversed,
        startCorner: undefined,
        endCorner: undefined,
      },
    ]
  }
  const holes: ComputedStitchHoleSchema[] = []
  for (const traversal of traversals) {
    const traversalHoles = calculateTraversalHoles(traversal, distance, stitchLine.stitchHoleLength)
    for (const hole of traversalHoles) {
      const previous = holes[holes.length - 1]
      if (!isDefined(previous) || !arePointsEqual(previous.center, hole.center)) {
        holes.push(hole)
      }
    }
  }
  if (calculatedPath.isClosed && holes.length > 1) {
    const first = holes[0]
    let last = holes[holes.length - 1]
    while (holes.length > 1 && isHoleTooCloseToEndpoint(last.center, first.center, distance)) {
      holes.pop()
      last = holes[holes.length - 1]
    }
  }
  return holes
}

const calculateStitchHoleTraversals = (path: CalculatedStitchLinePath, reversed: boolean): StitchHoleTraversal[] => {
  let fragments = reversed ? [...path.fragments].reverse() : path.fragments
  if (path.isClosed) {
    const startCornerIndex = fragments.findIndex(
      (fragment) => isSharpCorner(fragment) && arePointsEqual(fragment.start, path.fragments[0].start),
    )
    const firstSharp = startCornerIndex === -1 ? fragments.findIndex(isSharpCorner) : startCornerIndex
    fragments = [...fragments.slice(firstSharp), ...fragments.slice(0, firstSharp), fragments[firstSharp]]
  }
  const traversals: StitchHoleTraversal[] = []
  let segments: StitchHoleSegment[] = []
  let startCorner: StitchCornerPathFragment | undefined
  for (const fragment of fragments) {
    if (isSharpCorner(fragment)) {
      if (segments.length > 0) {
        traversals.push({ segments, reversed, startCorner, endCorner: fragment })
      }
      segments = []
      startCorner = fragment
    } else {
      const fragmentSegments = createStitchHoleSegments([fragment])
      segments.push(...(reversed ? reverseSegments(fragmentSegments) : fragmentSegments))
    }
  }
  if (segments.length > 0) {
    traversals.push({ segments, reversed, startCorner, endCorner: undefined })
  }
  return traversals
}

const reverseSegments = (segments: StitchHoleSegment[]): StitchHoleSegment[] => {
  return [...segments].reverse().map((segment): StitchHoleSegment => {
    if (narrowers.path.is.stitchHoleLineSegment(segment)) {
      return { ...segment, start: segment.end, end: segment.start }
    }
    return { ...segment, start: segment.end, end: segment.start, reversed: segment.reversed !== true }
  })
}

const calculateTraversalHoles = (
  traversal: StitchHoleTraversal,
  distance: BigNumber,
  length: number,
): ComputedStitchHoleSchema[] => {
  const firstSegment = traversal.segments[0]
  if (!isDefined(firstSegment)) {
    return []
  }
  const rotation = isDefined(traversal.startCorner)
    ? getSharpCornerRotation(traversal.startCorner, traversal.reversed)
    : getSegmentTangentRotation(firstSegment, firstSegment.start)
  const holes = [createHole(firstSegment.start, rotation, length)]
  let previous = holes[0]
  let cursor = { segmentIndex: 0, point: previous.center }
  let next = findNextStitchHole(previous.center, distance, traversal.segments, cursor)
  while (isDefined(next)) {
    const hole = createHole(next.center, getStitchHoleRotation(previous.center, next.center), length)
    holes.push(hole)
    previous = hole
    cursor = next.cursor
    next = findNextStitchHole(previous.center, distance, traversal.segments, cursor)
  }
  if (isDefined(traversal.endCorner)) {
    const endpoint = traversal.endCorner.start
    while (holes.length > 0 && isHoleTooCloseToEndpoint(holes[holes.length - 1].center, endpoint, distance)) {
      holes.pop()
    }
    holes.push(createHole(endpoint, getSharpCornerRotation(traversal.endCorner, traversal.reversed), length))
  }
  return holes
}

const createHole = (center: PointSchema, rotation: number, length: number): ComputedStitchHoleSchema => ({
  center,
  rotation,
  line: getStitchHoleLine(center, rotation, length),
})

const getSharpCornerRotation = (corner: StitchCornerPathFragment, reversed: boolean): number => {
  let rotation: number
  switch (corner.corner) {
    case 'top-right':
      rotation = 0
      break
    case 'bottom-right':
      rotation = 90
      break
    case 'bottom-left':
      rotation = 180
      break
    case 'top-left':
      rotation = 270
      break
  }
  return reversed ? (rotation + 180) % 360 : rotation
}

const isHoleTooCloseToEndpoint = (center: PointSchema, endpoint: PointSchema, distance: BigNumber): boolean => {
  return getPointDistance(center, endpoint).isLessThanOrEqualTo(
    distance.times(MINIMUM_STITCH_HOLE_ENDPOINT_DISTANCE_FACTOR),
  )
}

const isSharpCorner = (fragment: StitchPathFragment): fragment is StitchCornerPathFragment => {
  return narrowers.path.is.cornerFragment(fragment) && fragment.radius.isZero()
}

const shiftClosedSegments = (segments: StitchHoleSegment[], offset: number): StitchHoleSegment[] => {
  const lengths = segments.map((segment): number => {
    if (narrowers.path.is.stitchHoleLineSegment(segment)) {
      return getPointDistance(segment.start, segment.end).toNumber()
    }
    return (segment.radius.toNumber() * Math.PI) / 2
  })
  const perimeter = lengths.reduce((sum, length) => sum + length, 0)
  if (perimeter <= 0) {
    return segments
  }
  let remaining = ((offset % perimeter) + perimeter) % perimeter
  if (remaining === 0) {
    return segments
  }
  for (let index = 0; index < segments.length; index += 1) {
    const length = lengths[index]
    if (remaining >= length) {
      remaining -= length
      continue
    }
    const segment = segments[index]
    const progress = remaining / length
    let point: PointSchema
    if (narrowers.path.is.stitchHoleLineSegment(segment)) {
      point = {
        x: segment.start.x.plus(segment.end.x.minus(segment.start.x).times(progress)),
        y: segment.start.y.plus(segment.end.y.minus(segment.start.y).times(progress)),
      }
    } else {
      const startAngle = Math.atan2(
        segment.start.y.minus(segment.center.y).toNumber(),
        segment.start.x.minus(segment.center.x).toNumber(),
      )
      const angle = startAngle + (progress * Math.PI) / 2
      point = {
        x: segment.center.x.plus(segment.radius.times(Math.cos(angle))),
        y: segment.center.y.plus(segment.radius.times(Math.sin(angle))),
      }
    }
    const result: StitchHoleSegment[] = []
    if (!arePointsEqual(point, segment.end)) {
      result.push({ ...segment, start: point })
    }
    result.push(...segments.slice(index + 1), ...segments.slice(0, index))
    if (!arePointsEqual(segment.start, point)) {
      result.push({ ...segment, end: point })
    }
    return result
  }
  return segments
}
