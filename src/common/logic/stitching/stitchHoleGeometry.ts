import BigNumber from 'bignumber.js'

import { POSITION_EPSILON, STITCH_HOLE_ENDPOINT_EPSILON_MM, TWO, ZERO } from '../../constants/layout'
import type { PointSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { getPointDistance } from '../geometryUtils'
import type { StitchCornerPathFragment, StitchPathFragment } from './calculateStitchLinePaths'

const FULL_TURN = Math.PI * 2

export type StitchHoleLineSegment = {
  type: 'line'
  start: PointSchema
  end: PointSchema
}

export type StitchHoleArcSegment = {
  type: 'arc'
  start: PointSchema
  end: PointSchema
  center: PointSchema
  radius: BigNumber
}

export type StitchHoleSegment = StitchHoleLineSegment | StitchHoleArcSegment

export type StitchHoleCursor = {
  segmentIndex: number
  point: PointSchema
}

type StitchHoleIntersection = {
  center: PointSchema
  cursor: StitchHoleCursor
}

export const createStitchHoleSegments = (fragments: StitchPathFragment[]): StitchHoleSegment[] => {
  return fragments.flatMap<StitchHoleSegment>((fragment): StitchHoleSegment[] => {
    if (fragment.type === 'side') {
      return [{ type: 'line', start: fragment.start, end: fragment.end }]
    }

    if (fragment.radius.isGreaterThan(ZERO)) {
      return [
        {
          type: 'arc',
          start: fragment.start,
          end: fragment.end,
          center: getCornerCenter(fragment),
          radius: fragment.radius,
        },
      ]
    }

    return []
  })
}

export const findNextStitchHole = (
  previousHoleCenter: PointSchema,
  stitchHoleDistance: BigNumber,
  segments: StitchHoleSegment[],
  cursor: StitchHoleCursor,
): StitchHoleIntersection | undefined => {
  for (let segmentIndex = cursor.segmentIndex; segmentIndex < segments.length; segmentIndex += 1) {
    const segment = segments[segmentIndex]
    const segmentLength =
      segment.type === 'line'
        ? getPointDistance(segment.start, segment.end)
        : segment.radius.times(
            getClockwiseAngleDifference(
              getPointAngle(segment.center, segment.start),
              getPointAngle(segment.center, segment.end),
            ),
          )
    if (segmentLength.isZero()) {
      continue
    }
    // Convert mm into normalized progress, keeping the physical tolerance independent of segment length.
    const parameterEpsilon = new BigNumber(POSITION_EPSILON).dividedBy(segmentLength)
    const minimumProgress = segmentIndex === cursor.segmentIndex ? getSegmentProgress(segment, cursor.point) : ZERO
    const intersections = getSegmentCircleIntersections(segment, previousHoleCenter, stitchHoleDistance)
    const nextIntersection = intersections.find(({ progress }) =>
      progress.isGreaterThan(minimumProgress.plus(parameterEpsilon)),
    )

    if (isDefined(nextIntersection)) {
      return {
        center: nextIntersection.point,
        cursor: { segmentIndex, point: nextIntersection.point },
      }
    }

    if (
      isSegmentEndAtStitchHoleDistance(previousHoleCenter, segment.end, stitchHoleDistance) &&
      new BigNumber(1).isGreaterThan(minimumProgress.plus(parameterEpsilon))
    ) {
      return {
        center: segment.end,
        cursor: { segmentIndex, point: segment.end },
      }
    }
  }

  return undefined
}

const isSegmentEndAtStitchHoleDistance = (
  previousHoleCenter: PointSchema,
  segmentEnd: PointSchema,
  stitchHoleDistance: BigNumber,
): boolean =>
  getPointDistance(previousHoleCenter, segmentEnd)
    .minus(stitchHoleDistance)
    .absoluteValue()
    .isLessThanOrEqualTo(STITCH_HOLE_ENDPOINT_EPSILON_MM)

export const getStitchHoleRotation = (previousCenter: PointSchema, currentCenter: PointSchema): number => {
  return getRotationFromVector(currentCenter.x.minus(previousCenter.x), currentCenter.y.minus(previousCenter.y))
}

export const getSegmentTangentRotation = (segment: StitchHoleSegment, point: PointSchema): number => {
  if (segment.type === 'line') {
    return getRotationFromVector(segment.end.x.minus(segment.start.x), segment.end.y.minus(segment.start.y))
  }

  return getRotationFromVector(point.y.minus(segment.center.y).negated(), point.x.minus(segment.center.x))
}

const getCornerCenter = (corner: StitchCornerPathFragment): PointSchema => {
  switch (corner.corner) {
    case 'top-right':
      return { x: corner.end.x.minus(corner.radius), y: corner.start.y.plus(corner.radius) }
    case 'bottom-right':
      return { x: corner.start.x.minus(corner.radius), y: corner.end.y.minus(corner.radius) }
    case 'bottom-left':
      return { x: corner.start.x, y: corner.end.y }
    case 'top-left':
      return { x: corner.end.x, y: corner.start.y }
  }
}

const getSegmentCircleIntersections = (
  segment: StitchHoleSegment,
  center: PointSchema,
  radius: BigNumber,
): { point: PointSchema; progress: BigNumber }[] => {
  switch (segment.type) {
    case 'line':
      return getLineCircleIntersections(segment, center, radius)
    case 'arc':
      return getArcCircleIntersections(segment, center, radius)
  }
}

const getLineCircleIntersections = (
  segment: StitchHoleLineSegment,
  center: PointSchema,
  radius: BigNumber,
): { point: PointSchema; progress: BigNumber }[] => {
  const deltaX = segment.end.x.minus(segment.start.x)
  const deltaY = segment.end.y.minus(segment.start.y)
  const fromCenterX = segment.start.x.minus(center.x)
  const fromCenterY = segment.start.y.minus(center.y)
  const a = deltaX.times(deltaX).plus(deltaY.times(deltaY))

  if (a.isZero()) {
    return []
  }

  const b = TWO.times(fromCenterX.times(deltaX).plus(fromCenterY.times(deltaY)))
  const c = fromCenterX.times(fromCenterX).plus(fromCenterY.times(fromCenterY)).minus(radius.times(radius))
  const discriminant = b.times(b).minus(new BigNumber(4).times(a).times(c))

  if (discriminant.isNegative()) {
    return []
  }

  const root = discriminant.sqrt()
  const parameters = [b.negated().minus(root).div(TWO.times(a)), b.negated().plus(root).div(TWO.times(a))]

  return parameters
    .filter((parameter, index) => index === 0 || !parameter.isEqualTo(parameters[0]))
    .filter((parameter) => parameter.isGreaterThanOrEqualTo(ZERO) && parameter.isLessThanOrEqualTo(1))
    .sort((first, second) => first.comparedTo(second) ?? 0)
    .map((progress) => ({
      progress,
      point: {
        x: segment.start.x.plus(deltaX.times(progress)),
        y: segment.start.y.plus(deltaY.times(progress)),
      },
    }))
}

const getArcCircleIntersections = (
  segment: StitchHoleArcSegment,
  center: PointSchema,
  radius: BigNumber,
): { point: PointSchema; progress: BigNumber }[] => {
  const segmentCenterX = segment.center.x.toNumber()
  const segmentCenterY = segment.center.y.toNumber()
  const centerX = center.x.toNumber()
  const centerY = center.y.toNumber()
  const segmentRadius = segment.radius.toNumber()
  const targetRadius = radius.toNumber()
  const deltaX = centerX - segmentCenterX
  const deltaY = centerY - segmentCenterY
  const centerDistance = Math.hypot(deltaX, deltaY)

  if (
    centerDistance === 0 ||
    centerDistance > segmentRadius + targetRadius ||
    centerDistance < Math.abs(segmentRadius - targetRadius)
  ) {
    return []
  }

  const distanceToChord = (segmentRadius ** 2 - targetRadius ** 2 + centerDistance ** 2) / (2 * centerDistance)
  const halfChord = Math.sqrt(Math.max(0, segmentRadius ** 2 - distanceToChord ** 2))
  const baseX = segmentCenterX + (distanceToChord * deltaX) / centerDistance
  const baseY = segmentCenterY + (distanceToChord * deltaY) / centerDistance
  const perpendicularX = (-deltaY * halfChord) / centerDistance
  const perpendicularY = (deltaX * halfChord) / centerDistance
  const candidates = [
    { x: baseX + perpendicularX, y: baseY + perpendicularY },
    { x: baseX - perpendicularX, y: baseY - perpendicularY },
  ]

  return candidates
    .filter((candidate, index) => index === 0 || !areNumberPointsEqual(candidate, candidates[0]))
    .map((candidate) => ({ point: { x: new BigNumber(candidate.x), y: new BigNumber(candidate.y) } }))
    .map(({ point }) => ({ point, progress: getArcProgress(segment, point) }))
    .filter(({ progress }) => progress.isGreaterThanOrEqualTo(ZERO) && progress.isLessThanOrEqualTo(1))
    .sort((first, second) => first.progress.comparedTo(second.progress) ?? 0)
}

const getSegmentProgress = (segment: StitchHoleSegment, point: PointSchema): BigNumber => {
  if (segment.type === 'line') {
    const deltaX = segment.end.x.minus(segment.start.x)
    if (!deltaX.isZero()) {
      return point.x.minus(segment.start.x).div(deltaX)
    }

    return point.y.minus(segment.start.y).div(segment.end.y.minus(segment.start.y))
  }

  return getArcProgress(segment, point)
}

const getArcProgress = (segment: StitchHoleArcSegment, point: PointSchema): BigNumber => {
  const startAngle = getPointAngle(segment.center, segment.start)
  const endAngle = getPointAngle(segment.center, segment.end)
  const pointAngle = getPointAngle(segment.center, point)
  const arcAngle = getClockwiseAngleDifference(startAngle, endAngle)
  const pointAngleDifference = getClockwiseAngleDifference(startAngle, pointAngle)
  const angleEpsilon = POSITION_EPSILON / segment.radius.toNumber()

  if (pointAngleDifference > arcAngle + angleEpsilon) {
    return new BigNumber(-1)
  }

  return new BigNumber(pointAngleDifference / arcAngle)
}

const getPointAngle = (center: PointSchema, point: PointSchema): number => {
  return normalizeAngle(Math.atan2(point.y.minus(center.y).toNumber(), point.x.minus(center.x).toNumber()))
}

const getClockwiseAngleDifference = (from: number, to: number): number => {
  return normalizeAngle(to - from)
}

const normalizeAngle = (angle: number): number => {
  return ((angle % FULL_TURN) + FULL_TURN) % FULL_TURN
}

const getRotationFromVector = (x: BigNumber, y: BigNumber): number => {
  const lineAngle = (Math.atan2(y.toNumber(), x.toNumber()) * 180) / Math.PI
  return (((lineAngle - 90) % 360) + 360) % 360
}

const areNumberPointsEqual = (first: { x: number; y: number }, second: { x: number; y: number }): boolean => {
  return Math.abs(first.x - second.x) < POSITION_EPSILON && Math.abs(first.y - second.y) < POSITION_EPSILON
}
