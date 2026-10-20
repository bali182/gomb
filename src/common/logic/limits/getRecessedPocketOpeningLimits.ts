import BigNumber from 'bignumber.js'

import { OUTER_RADIUS_SEARCH_PRECISION } from '../../constants/layout'
import type {
  PocketClusterSchema,
  PocketOrientationSchema,
  RecessedPocketOpeningSchema,
} from '../../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { NumericBoundSchema, RecessedPocketOpeningLimitsSchema } from '../../schemas/limits'
import { accessors } from '../../utils/accessors'
import { clamp } from '../../utils/clamp'
import { isDefined } from '../../utils/isDefined'
import { getTPocketTabDepth } from '../pocketUtils'

/**
 * Preserves the inner offset before adjusting the outer inset.
 * Depth is bounded using the unrounded recess. Inner rounding stays inside that recess, while outer
 * rounding can expand it. The inner radius is therefore fixed before finding the outer radius limit.
 * Only bounds are returned. The source opening is never changed.
 */
export const getRecessedPocketOpeningLimits = (
  opening: RecessedPocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  frontPocket: ComputedTopPocketSchema,
  tPockets: readonly ComputedTPocketSchema[],
): RecessedPocketOpeningLimitsSchema => {
  const pockets = getRelevantPockets(opening, pocketCluster, frontPocket, tPockets)
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? frontPocket.boundingRect.width : frontPocket.boundingRect.height
  const halfWidth = width.dividedBy(2)
  const innerOffsetMaximum: NumericBoundSchema = {
    value: halfWidth,
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
  const adjusted: RecessedPocketOpeningSchema = {
    ...opening,
    innerOffset: clamp(opening.innerOffset, 0, innerOffsetMaximum.value).toNumber(),
  }
  const outerInsetMaximum: NumericBoundSchema = {
    value: halfWidth.minus(adjusted.innerOffset),
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
  adjusted.outerInset = clamp(opening.outerInset, 0, outerInsetMaximum.value).toNumber()

  let depthMaximum: NumericBoundSchema | undefined
  for (const pocket of pockets) {
    const maximum =
      pocket.type === 'computed-top-pocket'
        ? getFrontPocketDepthMaximum(adjusted, pocket, pocketCluster.orientation)
        : getTPocketDepthMaximum(adjusted, pocket, pocketCluster)
    if (!isDefined(depthMaximum) || maximum.value.isLessThan(depthMaximum.value)) {
      depthMaximum = maximum
    }
  }
  const limits: RecessedPocketOpeningLimitsSchema = {
    type: 'recessed',
    innerOffset: { max: innerOffsetMaximum },
    outerInset: {
      max: outerInsetMaximum,
    },
    depth: { max: depthMaximum },
  }
  if (isDefined(depthMaximum)) {
    adjusted.depth = clamp(opening.depth, 0, depthMaximum.value).toNumber()
  }
  if (adjusted.depth === 0) {
    return limits
  }

  const innerRadiusMaximum = getInnerRadiusMaximum(adjusted, width)
  limits.innerRadius = { max: innerRadiusMaximum }
  adjusted.innerRadius = clamp(opening.innerRadius, 0, innerRadiusMaximum.value).toNumber()

  let outerRadiusMaximum: NumericBoundSchema | undefined
  for (const pocket of pockets) {
    const maximum = getOuterRadiusMaximum(adjusted, pocket, pocketCluster)
    if (!isDefined(outerRadiusMaximum) || maximum.value.isLessThan(outerRadiusMaximum.value)) {
      outerRadiusMaximum = maximum
    }
  }
  limits.outerRadius = { max: outerRadiusMaximum }
  return limits
}

const getRelevantPockets = (
  opening: RecessedPocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  frontPocket: ComputedTopPocketSchema,
  tPockets: readonly ComputedTPocketSchema[],
): readonly (ComputedTopPocketSchema | ComputedTPocketSchema)[] => {
  const openingAccessor = accessors.pocketCluster(pocketCluster)
  const pockets: (ComputedTopPocketSchema | ComputedTPocketSchema)[] = []
  const tPocket = tPockets.find((_, index) => openingAccessor.opening(index + 1).id === opening.id)
  if (isDefined(tPocket)) {
    pockets.push(tPocket)
  }
  if (openingAccessor.opening(pocketCluster.pocketCount).id === opening.id) {
    pockets.push(frontPocket)
  }
  if (pockets.length === 0) {
    pockets.push(frontPocket)
    const firstTPocket = tPockets[0]
    if (isDefined(firstTPocket)) {
      pockets.push(firstTPocket)
    }
  }
  return pockets
}

const getFrontPocketDepthMaximum = (
  opening: RecessedPocketOpeningSchema,
  pocket: ComputedTopPocketSchema,
  orientation: PocketOrientationSchema,
): NumericBoundSchema => {
  const isVertical = orientation === 'up' || orientation === 'down'
  const width = isVertical ? pocket.boundingRect.width : pocket.boundingRect.height
  const pocketDepth = isVertical ? pocket.boundingRect.height : pocket.boundingRect.width
  const innerCornerX = width.dividedBy(2).minus(opening.innerOffset)
  let maximum: NumericBoundSchema = {
    value: BigNumber.maximum(pocketDepth.minus(1), 0),
    reason: 'pocket-opening-depth',
    severity: 'warning',
  }
  const radius = pocket.cornerRadius
  let closedCornerRadii: BigNumber[]
  switch (orientation) {
    case 'up':
      closedCornerRadii = [radius.bottomLeft, radius.bottomRight]
      break
    case 'down':
      closedCornerRadii = [radius.topLeft, radius.topRight]
      break
    case 'left':
      closedCornerRadii = [radius.topRight, radius.bottomRight]
      break
    case 'right':
      closedCornerRadii = [radius.topLeft, radius.bottomLeft]
      break
  }
  for (const cornerRadius of closedCornerRadii) {
    if (innerCornerX.isGreaterThanOrEqualTo(cornerRadius)) {
      continue
    }
    const availableDepth = pocketDepth
      .minus(cornerRadius)
      .plus(BigNumber.maximum(cornerRadius.pow(2).minus(cornerRadius.minus(innerCornerX).pow(2)), 0).sqrt())
    if (availableDepth.isLessThan(maximum.value)) {
      maximum = { value: BigNumber.maximum(availableDepth, 0), reason: 'pocket-opening-boundary', severity: 'warning' }
    }
  }
  return maximum
}

const getTPocketDepthMaximum = (
  opening: RecessedPocketOpeningSchema,
  pocket: ComputedTPocketSchema,
  pocketCluster: PocketClusterSchema,
): NumericBoundSchema => {
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? pocket.boundingRect.width : pocket.boundingRect.height
  const pocketDepth = isVertical ? pocket.boundingRect.height : pocket.boundingRect.width
  const tabDepth = getTPocketTabDepth(pocketCluster, pocket.boundingRect)
  const tabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const taper = new BigNumber(pocketCluster.tPocketTaper)
  const innerCornerX = width.dividedBy(2).minus(opening.innerOffset)
  let maximum: NumericBoundSchema = {
    value: BigNumber.maximum(pocketDepth.minus(1), 0),
    reason: 'pocket-opening-depth',
    severity: 'warning',
  }
  if (maximum.value.isLessThanOrEqualTo(tabDepth)) {
    return maximum
  }

  // Above the shoulder the full width is available. Below it, the unrounded side must
  // clear the shoulder endpoint and its bottom corner must clear the tapered edge.
  let boundaryMaximum = maximum.value
  if (tabWidth.isGreaterThan(opening.outerInset)) {
    const shoulderMaximum = innerCornerX
      .minus(opening.outerInset)
      .times(tabDepth)
      .dividedBy(tabWidth.minus(opening.outerInset))
    boundaryMaximum = BigNumber.minimum(boundaryMaximum, BigNumber.maximum(tabDepth, shoulderMaximum))
  }
  if (taper.isGreaterThan(tabWidth)) {
    const taperMaximum = tabDepth.plus(
      pocketDepth.minus(tabDepth).times(innerCornerX.minus(tabWidth)).dividedBy(taper.minus(tabWidth)),
    )
    boundaryMaximum = BigNumber.minimum(boundaryMaximum, BigNumber.maximum(tabDepth, taperMaximum))
  }
  if (boundaryMaximum.isLessThan(maximum.value)) {
    maximum = { value: boundaryMaximum, reason: 'pocket-opening-boundary', severity: 'warning' }
  }
  return maximum
}

const getInnerRadiusMaximum = (opening: RecessedPocketOpeningSchema, openingWidth: BigNumber): NumericBoundSchema => {
  const horizontalDistance = openingWidth.dividedBy(2).minus(opening.innerOffset).minus(opening.outerInset)
  const depth = new BigNumber(opening.depth)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  return {
    value: new BigNumber(opening.innerOffset).dividedBy(angleFactor),
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
}

const getOuterRadiusMaximum = (
  opening: RecessedPocketOpeningSchema,
  pocket: ComputedTopPocketSchema | ComputedTPocketSchema,
  pocketCluster: PocketClusterSchema,
): NumericBoundSchema => {
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? pocket.boundingRect.width : pocket.boundingRect.height
  const horizontalDistance = width.dividedBy(2).minus(opening.innerOffset).minus(opening.outerInset)
  const depth = new BigNumber(opening.depth)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  const availableTop = new BigNumber(opening.outerInset)
  const separatedMaximum = availableTop.dividedBy(angleFactor)
  const innerEndX = width
    .dividedBy(2)
    .minus(opening.innerOffset)
    .plus(new BigNumber(opening.innerRadius).times(angleFactor))
  let upperBound = separatedMaximum
  if (separatedMaximum.plus(opening.innerRadius).times(angleFactor).isGreaterThan(sideLength)) {
    upperBound = innerEndX.pow(2).plus(depth.pow(2)).dividedBy(depth.times(2)).minus(opening.innerRadius)
  }
  upperBound = BigNumber.maximum(upperBound, 0)
  const maximum: NumericBoundSchema = { value: upperBound, reason: 'pocket-opening-width', severity: 'warning' }
  if (pocket.type === 'computed-top-pocket') {
    return maximum
  }
  const tabDepth = getTPocketTabDepth(pocketCluster, pocket.boundingRect)
  if (depth.isLessThanOrEqualTo(tabDepth)) {
    return maximum
  }
  const tabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  if (
    getOuterTransitionX({ ...opening, outerRadius: upperBound.toNumber() }, width, tabDepth).isGreaterThanOrEqualTo(
      tabWidth,
    )
  ) {
    return maximum
  }

  // With the inner circle fixed, increasing the outer radius only moves this boundary
  // outward. The valid interval starts at zero, so bisection cannot skip a valid range.
  let lowerBound = new BigNumber(0)
  while (upperBound.minus(lowerBound).isGreaterThan(OUTER_RADIUS_SEARCH_PRECISION)) {
    const candidate = upperBound.plus(lowerBound).dividedBy(2)
    const candidateOpening: RecessedPocketOpeningSchema = { ...opening, outerRadius: candidate.toNumber() }
    if (getOuterTransitionX(candidateOpening, width, tabDepth).isGreaterThanOrEqualTo(tabWidth)) {
      lowerBound = candidate
    } else {
      upperBound = candidate
    }
  }
  return { value: lowerBound, reason: 'pocket-opening-boundary', severity: 'warning' }
}

/** X on the left transition at a given depth, using the same two arc arrangements as the path. */
const getOuterTransitionX = (
  opening: RecessedPocketOpeningSchema,
  openingWidth: BigNumber,
  distanceFromOpening: BigNumber,
): BigNumber => {
  const depth = new BigNumber(opening.depth)
  const horizontalDistance = openingWidth.dividedBy(2).minus(opening.innerOffset).minus(opening.outerInset)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  const outerRadius = new BigNumber(opening.outerRadius)
  const innerRadius = new BigNumber(opening.innerRadius)
  const innerEndX = openingWidth.dividedBy(2).minus(opening.innerOffset).plus(innerRadius.times(angleFactor))
  const remainingDepth = depth.minus(distanceFromOpening)
  let outerStartX: BigNumber
  let outerEndDepth: BigNumber

  if (outerRadius.plus(innerRadius).times(angleFactor).isLessThan(sideLength)) {
    const oneMinusCosine = angleFactor.pow(2).times(2).dividedBy(angleFactor.pow(2).plus(1))
    outerStartX = new BigNumber(opening.outerInset).minus(outerRadius.times(angleFactor))
    outerEndDepth = outerRadius.times(oneMinusCosine)
    if (
      distanceFromOpening.isGreaterThanOrEqualTo(outerEndDepth) &&
      remainingDepth.isGreaterThan(innerRadius.times(oneMinusCosine))
    ) {
      return new BigNumber(opening.outerInset).plus(horizontalDistance.times(distanceFromOpening).dividedBy(depth))
    }
  } else {
    const radiusSum = outerRadius.plus(innerRadius)
    outerStartX = innerEndX.minus(depth.times(radiusSum.times(2).minus(depth)).sqrt())
    outerEndDepth = depth.times(outerRadius).dividedBy(radiusSum)
  }
  if (distanceFromOpening.isLessThan(outerEndDepth)) {
    return outerStartX.plus(
      BigNumber.maximum(outerRadius.times(2).times(distanceFromOpening).minus(distanceFromOpening.pow(2)), 0).sqrt(),
    )
  }
  return innerEndX.minus(
    BigNumber.maximum(innerRadius.times(2).times(remainingDepth).minus(remainingDepth.pow(2)), 0).sqrt(),
  )
}
