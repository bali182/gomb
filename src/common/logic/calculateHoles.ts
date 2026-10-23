import BigNumber from 'bignumber.js'

import type { AnchorSchema } from '../schemas/common'
import type { ComputedComponentSchema, ComputedHoleSchema } from '../schemas/computed'
import type { RectSchema } from '../schemas/geometry'
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
): ComputedHoleSchema[] => {
  return holes.flatMap((hole): ComputedHoleSchema[] => {
    const ownerComponent = computedComponents[hole.componentId]
    if (!isDefined(ownerComponent) || ownerComponent.type === 'computed-pocket-cluster') {
      return []
    }
    return [calculateHole(hole, ownerComponent)]
  })
}

const calculateHole = (hole: HoleSchema, ownerComponent: ComputedComponentSchema): ComputedHoleSchema => {
  const boundingRect = calculateHoleBoundingRect(
    ownerComponent.boundingRect,
    new BigNumber(hole.width),
    new BigNumber(hole.height),
    hole,
  )

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
    path,
    cornerRadius,
    highlightPath: isClosedPathCoveredBy(path, ownerComponent.path)
      ? path
      : intersectClosedPaths(path, ownerComponent.path),
  }
}
const calculateHoleBoundingRect = (
  ownerBoundingRect: RectSchema,
  width: BigNumber,
  height: BigNumber,
  hole: HoleSchema,
): RectSchema => {
  return {
    x: calculateAnchoredAxisStart(ownerBoundingRect.x, ownerBoundingRect.width, width, hole.xAnchor, hole.xOffset),
    y: calculateAnchoredAxisStart(ownerBoundingRect.y, ownerBoundingRect.height, height, hole.yAnchor, hole.yOffset),
    width,
    height,
  }
}

const calculateAnchoredAxisStart = (
  ownerStart: BigNumber,
  ownerLength: BigNumber,
  holeLength: BigNumber,
  anchor: AnchorSchema,
  offset: number,
): BigNumber => {
  switch (anchor) {
    case 'start':
      return ownerStart.plus(offset)
    case 'middle':
      return ownerStart.plus(ownerLength.dividedBy(2)).plus(offset).minus(holeLength.dividedBy(2))
    case 'end':
      return ownerStart.plus(ownerLength).minus(offset).minus(holeLength)
  }
}
