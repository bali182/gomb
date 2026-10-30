import type { ComputedStitchHoleSchema, ComputedStitchRouteDisconnectedCornerSchema } from '../../schemas/computed'
import type { ResolvedComponentBoundsStitchLineSchema, StitchCornerSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import type { CalculatedStitchLinePath, StitchSidePathFragment } from './calculateStitchLinePaths'
import { isCanonicalDirection } from './stitchLinePathUtils'

export const calculateRouteDisconnectedCorners = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  calculatedPath: CalculatedStitchLinePath,
  holes: ComputedStitchHoleSchema[],
): Record<StitchCornerSchema, ComputedStitchRouteDisconnectedCornerSchema | undefined> => {
  const disconnectedCorners: Record<StitchCornerSchema, ComputedStitchRouteDisconnectedCornerSchema | undefined> = {
    'top-left': undefined,
    'top-right': undefined,
    'bottom-right': undefined,
    'bottom-left': undefined,
  }
  if (calculatedPath.isClosed || holes.length === 0) {
    return disconnectedCorners
  }

  const firstFragment = calculatedPath.fragments[0]
  const lastFragment = calculatedPath.fragments[calculatedPath.fragments.length - 1]

  appendDisconnectedCorner(disconnectedCorners, stitchLine, calculatedPath, holes, firstFragment, 'start')
  appendDisconnectedCorner(disconnectedCorners, stitchLine, calculatedPath, holes, lastFragment, 'end')

  return disconnectedCorners
}

const appendDisconnectedCorner = (
  disconnectedCorners: Record<StitchCornerSchema, ComputedStitchRouteDisconnectedCornerSchema | undefined>,
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  calculatedPath: CalculatedStitchLinePath,
  holes: ComputedStitchHoleSchema[],
  fragment: CalculatedStitchLinePath['fragments'][number] | undefined,
  endpoint: 'start' | 'end',
): void => {
  if (!isDefined(fragment) || !narrowers.path.is.sideFragment(fragment)) {
    return
  }

  const corner = getSideEndpointCorner(fragment, endpoint)
  if (isStitchLineCornerEnabled(stitchLine, corner)) {
    return
  }

  const hole = getRouteEndpointHole(stitchLine, calculatedPath, holes, fragment, endpoint)
  if (!isDefined(hole)) {
    return
  }

  disconnectedCorners[corner] = { side: fragment.side, hole }
}

const getRouteEndpointHole = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  calculatedPath: CalculatedStitchLinePath,
  holes: ComputedStitchHoleSchema[],
  side: StitchSidePathFragment,
  endpoint: 'start' | 'end',
): ComputedStitchHoleSchema | undefined => {
  const firstHole = holes[0]
  const lastHole = holes[holes.length - 1]
  if (!isDefined(firstHole) || !isDefined(lastHole)) {
    return undefined
  }

  const holesAreReversed = calculatedPath.fragments.length === 1 && !isCanonicalDirection(stitchLine, side)
  const useFirstHole = holesAreReversed ? endpoint === 'end' : endpoint === 'start'

  return useFirstHole ? firstHole : lastHole
}

const getSideEndpointCorner = (side: StitchSidePathFragment, endpoint: 'start' | 'end'): StitchCornerSchema => {
  switch (side.side) {
    case 'top':
      return endpoint === 'start' ? 'top-left' : 'top-right'
    case 'right':
      return endpoint === 'start' ? 'top-right' : 'bottom-right'
    case 'bottom':
      return endpoint === 'start' ? 'bottom-right' : 'bottom-left'
    case 'left':
      return endpoint === 'start' ? 'bottom-left' : 'top-left'
  }
}

const isStitchLineCornerEnabled = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  corner: StitchCornerSchema,
): boolean => {
  switch (corner) {
    case 'top-left':
      return stitchLine.topLeftCorner
    case 'top-right':
      return stitchLine.topRightCorner
    case 'bottom-right':
      return stitchLine.bottomRightCorner
    case 'bottom-left':
      return stitchLine.bottomLeftCorner
  }
}
