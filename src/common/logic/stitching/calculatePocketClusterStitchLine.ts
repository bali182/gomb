import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { PocketClusterSchema, PocketOrientationSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedPocketClusterStitchLineSchema, StitchSideSchema } from '../../schemas/stitching'
import { normalizePocketCluster } from '../normalizePocketCluster'
import { calculateRouteStitches } from './calculateRouteStitches'
import { calculateStitchLineBoundingRect } from './calculateStitchLineBoundingRect'
import { calculateTPocketStitchHoles } from './calculateTPocketStitchHoles'
import { calculateTPocketStitchLine } from './calculateTPocketStitchLine'

export const calculatePocketClusterStitchLine = (
  stitchLine: ResolvedPocketClusterStitchLineSchema,
  pocketCluster: PocketClusterSchema,
  computedPocketCluster: ComputedPocketClusterSchema,
): ComputedStitchLineSchema => {
  const normalizedPocketCluster = normalizePocketCluster(pocketCluster, computedPocketCluster.boundingRect)
  const calculatedStitchLines = computedPocketCluster.tPockets.map((tPocket) =>
    calculateTPocketStitchLine(stitchLine, normalizedPocketCluster, tPocket),
  )
  const points = calculatedStitchLines.flatMap((calculatedStitchLine) => [
    calculatedStitchLine.line.start,
    calculatedStitchLine.line.end,
  ])
  const routes = calculatedStitchLines.map((calculatedStitchLine) => {
    const holes = calculateTPocketStitchHoles(stitchLine, calculatedStitchLine.line)

    return {
      boundingRect: calculateStitchLineBoundingRect([calculatedStitchLine.line.start, calculatedStitchLine.line.end]),
      path: calculatedStitchLine.path,
      holes,
      isClosed: false,
      stitches: calculateRouteStitches(holes, false),
      labelPosition: getPocketClusterStitchRouteLabelPosition(normalizedPocketCluster.orientation),
      disconnectedCorners: {
        'top-left': undefined,
        'top-right': undefined,
        'bottom-right': undefined,
        'bottom-left': undefined,
      },
    }
  })

  return {
    stitchLineId: stitchLine.id,
    type: stitchLine.type,
    targetType: stitchLine.targetType,
    targetId: stitchLine.targetId,
    componentId: stitchLine.targetId,
    onTop: stitchLine.targetId,
    autoComputedCornerRadius: ZERO_CORNER_RADIUS,
    boundingRect: calculateStitchLineBoundingRect(points),
    routes,
    connectingStitches: [],
  }
}

const getPocketClusterStitchRouteLabelPosition = (orientation: PocketOrientationSchema): StitchSideSchema => {
  switch (orientation) {
    case 'up':
      return 'top'
    case 'down':
      return 'bottom'
    case 'left':
      return 'left'
    case 'right':
      return 'right'
  }
}
