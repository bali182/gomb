import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import { ComputedStitchHoleSchema } from '../../schemas/computed'
import { PointSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { getPointDistance } from '../geometryUtils'
import type { CalculatedStitchLinePath, StitchPathFragment, StitchSidePathFragment } from './calculateStitchLinePaths'
import { getStitchHoleLine } from './getStitchHoleLine'
import {
  createStitchHoleSegments,
  findNextStitchHole,
  getSegmentTangentRotation,
  getStitchHoleRotation,
  type StitchHoleSegment,
} from './stitchHoleGeometry'
import { isCanonicalDirection } from './stitchLinePathUtils'

const MINIMUM_STITCH_HOLE_ENDPOINT_DISTANCE_FACTOR = new BigNumber(0.5)

type StitchHoleTraversal = {
  segments: StitchHoleSegment[]
  startsAt: PointSchema
  endsAt: PointSchema
  endsAtSharpCorner: boolean
}

export const calculateStitchLineHoles = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  calculatedPath: CalculatedStitchLinePath,
): ComputedStitchHoleSchema[] => {
  const stitchHoleDistance = new BigNumber(stitchLine.stitchHoleDistance)

  if (!stitchHoleDistance.isGreaterThan(0)) {
    return []
  }

  const traversals = calculateStitchHoleTraversals(stitchLine, calculatedPath.fragments)
  const holes = traversals.flatMap((traversal) => {
    const traversalHoles = calculateTraversalHoles(traversal, stitchHoleDistance, stitchLine.stitchHoleLength)

    return traversal.endsAtSharpCorner
      ? removeHoleTooCloseToEndpoint(traversalHoles, traversal.endsAt, stitchHoleDistance)
      : traversalHoles
  })

  return calculatedPath.isClosed && !hasSharpCorner(calculatedPath.fragments)
    ? removeHoleTooCloseToRouteStart(holes, calculatedPath.fragments[0].start, stitchHoleDistance)
    : holes
}

const calculateStitchHoleTraversals = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  fragments: StitchPathFragment[],
): StitchHoleTraversal[] => {
  const orientedFragments = orientFragments(stitchLine, fragments)
  const traversals: StitchHoleTraversal[] = []
  let currentFragments: StitchPathFragment[] = []

  for (const fragment of orientedFragments) {
    if (isSharpCorner(fragment)) {
      appendTraversal(traversals, currentFragments, true, fragment.start)
      currentFragments = []
      continue
    }

    currentFragments.push(fragment)
  }

  const finalFragment = orientedFragments[orientedFragments.length - 1]
  const finalEndpoint = isDefined(finalFragment) ? finalFragment.end : undefined
  if (isDefined(finalEndpoint)) {
    appendTraversal(traversals, currentFragments, false, finalEndpoint)
  }

  return traversals
}

const orientFragments = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  fragments: StitchPathFragment[],
): StitchPathFragment[] => {
  if (fragments.some((fragment) => narrowers.path.is.cornerFragment(fragment))) {
    return fragments
  }

  const side = fragments[0]
  if (!narrowers.path.is.sideFragment(side) || isCanonicalDirection(stitchLine, side)) {
    return fragments
  }

  return [reverseSideFragment(side)]
}

const reverseSideFragment = (side: StitchSidePathFragment): StitchSidePathFragment => {
  return { ...side, start: side.end, end: side.start }
}

const appendTraversal = (
  traversals: StitchHoleTraversal[],
  fragments: StitchPathFragment[],
  endsAtSharpCorner: boolean,
  endsAt: PointSchema,
): void => {
  const segments = createStitchHoleSegments(fragments)
  const firstSegment = segments[0]

  if (!isDefined(firstSegment)) {
    return
  }

  traversals.push({
    segments,
    startsAt: firstSegment.start,
    endsAt,
    endsAtSharpCorner,
  })
}

const calculateTraversalHoles = (
  traversal: StitchHoleTraversal,
  stitchHoleDistance: BigNumber,
  stitchHoleLength: number,
): ComputedStitchHoleSchema[] => {
  const firstSegment = traversal.segments[0]
  if (!isDefined(firstSegment)) {
    return []
  }

  const firstRotation = getSegmentTangentRotation(firstSegment, traversal.startsAt)
  const holes: ComputedStitchHoleSchema[] = [
    {
      center: traversal.startsAt,
      rotation: firstRotation,
      line: getStitchHoleLine(traversal.startsAt, firstRotation, stitchHoleLength),
    },
  ]
  let previousHole = holes[0]
  let cursor = { segmentIndex: 0, point: traversal.startsAt }
  let nextHole = findNextStitchHole(previousHole.center, stitchHoleDistance, traversal.segments, cursor)

  while (isDefined(nextHole)) {
    const rotation = getStitchHoleRotation(previousHole.center, nextHole.center)
    const hole: ComputedStitchHoleSchema = {
      center: nextHole.center,
      rotation,
      line: getStitchHoleLine(nextHole.center, rotation, stitchHoleLength),
    }
    holes.push(hole)
    previousHole = hole
    cursor = nextHole.cursor
    nextHole = findNextStitchHole(previousHole.center, stitchHoleDistance, traversal.segments, cursor)
  }

  return holes
}

const removeHoleTooCloseToEndpoint = (
  holes: ComputedStitchHoleSchema[],
  endpoint: PointSchema,
  stitchHoleDistance: BigNumber,
): ComputedStitchHoleSchema[] => {
  const lastHole = holes[holes.length - 1]

  if (!isDefined(lastHole) || !isHoleTooCloseToEndpoint(lastHole.center, endpoint, stitchHoleDistance)) {
    return holes
  }

  return holes.slice(0, -1)
}

const removeHoleTooCloseToRouteStart = (
  holes: ComputedStitchHoleSchema[],
  routeStart: PointSchema,
  stitchHoleDistance: BigNumber,
): ComputedStitchHoleSchema[] => {
  let result = holes
  let lastHole = result[result.length - 1]

  while (
    result.length > 1 &&
    isDefined(lastHole) &&
    isHoleTooCloseToEndpoint(lastHole.center, routeStart, stitchHoleDistance)
  ) {
    result = result.slice(0, -1)
    lastHole = result[result.length - 1]
  }

  return result
}

const isHoleTooCloseToEndpoint = (
  holeCenter: PointSchema,
  endpoint: PointSchema,
  stitchHoleDistance: BigNumber,
): boolean => {
  const minimumDistance = stitchHoleDistance.times(MINIMUM_STITCH_HOLE_ENDPOINT_DISTANCE_FACTOR)
  return getPointDistance(holeCenter, endpoint).isLessThanOrEqualTo(minimumDistance)
}

const isSharpCorner = (fragment: StitchPathFragment): boolean => {
  return narrowers.path.is.cornerFragment(fragment) && fragment.radius.isZero()
}

const hasSharpCorner = (fragments: StitchPathFragment[]): boolean => {
  return fragments.some(isSharpCorner)
}
