import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { calculateRouteStitches } from './calculateRouteStitches'
import { calculateStitchLineBoundingRect } from './calculateStitchLineBoundingRect'
import { calculateStitchLineHoles } from './calculateStitchLineHoles'
import { calculateStitchLinePath } from './calculateStitchLinePaths'
import type { ComponentBoundsStitchLineTarget, StitchLineGeometry, StitchRouteGeometry } from './helperTypes'
import { getStitchLineAutoCornerRadius } from './stitchLineRadiusUtils'

export const calculateComponentBoundsStitchLine = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): StitchLineGeometry => {
  const calculatedPath = calculateStitchLinePath(stitchLine, target)
  const calculatedPaths = isDefined(calculatedPath) ? [calculatedPath] : []
  const points = calculatedPaths.flatMap((calculatedPath) =>
    calculatedPath.fragments.flatMap((fragment) => [fragment.start, fragment.end]),
  )
  const routes = calculatedPaths.map((calculatedPath): StitchRouteGeometry => {
    const holes = calculateStitchLineHoles(stitchLine, calculatedPath)
    const routePoints = calculatedPath.fragments.flatMap((fragment) => [fragment.start, fragment.end])

    return {
      targetType: stitchLine.targetType,
      targetId: stitchLine.targetId,
      boundingRect: calculateStitchLineBoundingRect(routePoints),
      path: calculatedPath.path,
      fragments: calculatedPath.fragments,
      holes,
      isClosed: calculatedPath.isClosed,
      stitches: calculateRouteStitches(holes, calculatedPath.isClosed),
      labelPosition: calculatedPath.labelPosition,
    }
  })

  return {
    stitchLineId: stitchLine.id,
    type: stitchLine.type,
    targetType: stitchLine.targetType,
    targetId: stitchLine.targetId,
    componentId: target.componentId,
    autoComputedCornerRadius: getStitchLineAutoCornerRadius(stitchLine, target),
    boundingRect: calculateStitchLineBoundingRect(points),
    routes,
  }
}
