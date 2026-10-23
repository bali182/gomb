import BigNumber from 'bignumber.js'

import { ComputedStitchHoleSchema } from '../../schemas/computed'
import type { LineSchema } from '../../schemas/geometry'
import type { ResolvedTPocketStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { getStitchHoleLine } from './getStitchHoleLine'
import {
  findNextStitchHole,
  getSegmentTangentRotation,
  getStitchHoleRotation,
  type StitchHoleLineSegment,
} from './stitchHoleGeometry'

export const calculateTPocketStitchHoles = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  line: LineSchema,
): ComputedStitchHoleSchema[] => {
  const stitchHoleDistance = new BigNumber(stitchLine.stitchHoleDistance)

  if (!stitchHoleDistance.isGreaterThan(0)) {
    return []
  }

  const directedLine = stitchLine.stitchDirection === 'start-to-end' ? line : { start: line.end, end: line.start }
  const segment: StitchHoleLineSegment = { type: 'line', start: directedLine.start, end: directedLine.end }
  const firstRotation = getSegmentTangentRotation(segment, segment.start)
  const holes: ComputedStitchHoleSchema[] = [
    {
      center: segment.start,
      rotation: firstRotation,
      line: getStitchHoleLine(segment.start, firstRotation, stitchLine.stitchHoleLength),
    },
  ]
  let previousHole = holes[0]
  let cursor = { segmentIndex: 0, point: segment.start }
  let nextHole = findNextStitchHole(previousHole.center, stitchHoleDistance, [segment], cursor)

  while (isDefined(nextHole)) {
    const rotation = getStitchHoleRotation(previousHole.center, nextHole.center)
    const hole: ComputedStitchHoleSchema = {
      center: nextHole.center,
      rotation,
      line: getStitchHoleLine(nextHole.center, rotation, stitchLine.stitchHoleLength),
    }
    holes.push(hole)
    previousHole = hole
    cursor = nextHole.cursor
    nextHole = findNextStitchHole(previousHole.center, stitchHoleDistance, [segment], cursor)
  }

  return holes
}
