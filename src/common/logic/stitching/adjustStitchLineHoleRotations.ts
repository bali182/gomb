import BigNumber from 'bignumber.js'
import type { ComputedStitchHoleSchema } from '../../schemas/computed'
import { isDefined } from '../../utils/isDefined'
import { getPointDistance } from '../geometryUtils'
import { getStitchHoleLine } from './getStitchHoleLine'

export const CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM = 0.2

export const adjustStitchLineHoleRotations = (
  holes: ComputedStitchHoleSchema[],
  roundedHoles: ReadonlySet<ComputedStitchHoleSchema>,
  stitchHoleDistance: number,
  stitchHoleLength: number,
  isClosed: boolean,
): ComputedStitchHoleSchema[] => {
  const targetLength = getTargetStitchLength(stitchHoleDistance, stitchHoleLength)
  const preserveClosingStitch = isClosed && hasIrregularClosingStitch(holes, stitchHoleDistance)
  const adjusted: ComputedStitchHoleSchema[] = []
  for (let index = 0; index < holes.length; index += 1) {
    const hole = holes[index]
    const previous = adjusted[index - 1]
    if (!isDefined(previous) || !roundedHoles.has(hole) || (preserveClosingStitch && index === holes.length - 1)) {
      adjusted.push(hole)
      continue
    }
    adjusted.push(adjustStitchHoleRotation(hole, previous, targetLength, stitchHoleLength))
  }
  return adjusted
}

const getTargetStitchLength = (distance: number, length: number): number => {
  const firstCenter = { x: new BigNumber(0), y: new BigNumber(0) }
  const secondCenter = { x: new BigNumber(distance), y: new BigNumber(0) }
  const first = getStitchHoleLine(firstCenter, 270, length)
  const second = getStitchHoleLine(secondCenter, 270, length)
  return getPointDistance(first.end, second.start).toNumber()
}

const hasIrregularClosingStitch = (holes: ComputedStitchHoleSchema[], distance: number): boolean => {
  if (holes.length < 2) {
    return false
  }
  const closingDistance = getPointDistance(holes[holes.length - 1].center, holes[0].center)
  return closingDistance.minus(distance).abs().gt(CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM)
}

const adjustStitchHoleRotation = (
  hole: ComputedStitchHoleSchema,
  previous: ComputedStitchHoleSchema,
  targetLength: number,
  length: number,
): ComputedStitchHoleSchema => {
  const halfLength = length / 2
  const deltaX = hole.center.x.minus(previous.line.end.x).toNumber()
  const deltaY = hole.center.y.minus(previous.line.end.y).toNumber()
  const centerDistance = Math.hypot(deltaX, deltaY)
  if (halfLength <= 0 || centerDistance === 0) {
    return hole
  }

  // The incoming endpoint lies on the hole's circle and, when reachable, on the target-length circle.
  const cosine =
    (targetLength * targetLength - centerDistance * centerDistance - halfLength * halfLength) /
    (2 * centerDistance * halfLength)
  const offsetAngle = Math.acos(Math.max(-1, Math.min(1, cosine)))
  const centerAngle = Math.atan2(deltaY, deltaX)
  const firstRotation = (((centerAngle + offsetAngle) * 180) / Math.PI + 135 + 360) % 360
  const secondRotation = (((centerAngle - offsetAngle) * 180) / Math.PI + 135 + 360) % 360
  const firstDifference = Math.abs(((firstRotation - hole.rotation + 540) % 360) - 180)
  const secondDifference = Math.abs(((secondRotation - hole.rotation + 540) % 360) - 180)
  const rotation = firstDifference <= secondDifference ? firstRotation : secondRotation
  return { center: hole.center, rotation, line: getStitchHoleLine(hole.center, rotation, length) }
}
