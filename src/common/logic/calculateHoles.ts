import { narrowers } from '../utils/narrowers'
import { applyStretchToBoundingBox } from './applyStretchToBoundingBox'
import { calculateAnchoredBoundingRect } from './calculateAnchoredBoundingRect'

import type { ComputedComponentSchema, ComputedHoleSchema } from '../schemas/computed'
import type { HoleSchema } from '../schemas/hole'
import { isDefined } from '../utils/isDefined'
import { calculateRectPath } from './calculateRectPath'
import { intersectClosedPaths, isClosedPathCoveredBy } from './closedPathBooleanUtils'
import { getCornerRadius } from './cornerRadiusUtils'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'
import { getCornerRadiusLimits } from './limits/getCornerRadiusLimits'

export const calculateHoles = (
  holes: HoleSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): Record<string, ComputedHoleSchema> => {
  const computedHoles: Record<string, ComputedHoleSchema> = {}
  for (const hole of holes) {
    const ownerComponent = computedComponents[hole.componentId]
    if (
      !isDefined(ownerComponent) ||
      narrowers.is.computedPocketCluster(ownerComponent) ||
      narrowers.is.computedGuide(ownerComponent)
    ) {
      continue
    }
    computedHoles[hole.id] = calculateHole(hole, ownerComponent)
  }
  return computedHoles
}

const calculateHole = (hole: HoleSchema, ownerComponent: ComputedComponentSchema): ComputedHoleSchema => {
  const layoutBoundingRect = calculateAnchoredBoundingRect(hole, ownerComponent.boundingRect)

  const boundingRect = applyStretchToBoundingBox(hole, layoutBoundingRect)

  // Holes have no parent, so parent component is not a limiting factor when calculating the radius
  const requestedRadius = getCornerRadius(hole)
  const cornerRadius = getAdjustedCornerRadius(
    requestedRadius,
    getCornerRadiusLimits({ boundingRect, cornerRadius: requestedRadius }),
  )

  const path = calculateRectPath(boundingRect, cornerRadius)

  return {
    holeId: hole.id,
    componentId: hole.componentId,
    boundingRect,
    layoutBoundingRect,
    path,
    cornerRadius,
    highlightPath: isClosedPathCoveredBy(path, ownerComponent.path)
      ? path
      : intersectClosedPaths(path, ownerComponent.path),
  }
}
