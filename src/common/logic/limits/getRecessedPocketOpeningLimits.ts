import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import { OUTER_RADIUS_SEARCH_PRECISION, POSITION_EPSILON } from '../../constants/layout'
import type {
  PocketClusterSchema,
  PocketOrientationSchema,
  PocketSchema,
  TPocketSchema,
} from '../../schemas/components'
import type { ComputedFrontPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { NumericBoundSchema, RecessedPocketOpeningLimitsSchema } from '../../schemas/limits'
import type { RecessedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { clamp } from '../../utils/clamp'
import { getTPocketTabDepth } from '../pocketUtils'
import { getSharedLengthMaximum } from './getSharedLengthMaximum'

/**
 * Reserves the opening margins, then preserves the inner offset before adjusting the outer inset.
 * Depth is bounded using the unrounded recess. Inner rounding stays inside that recess, while outer
 * rounding can expand it. The inner radius is therefore fixed before finding the outer radius limit.
 * Only bounds are returned. The source opening is never changed.
 */
export const getRecessedPocketOpeningLimits = (
  opening: RecessedPocketOpeningSchema,
  sourcePocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  computedPocket: ComputedFrontPocketSchema | ComputedTPocketSchema,
): RecessedPocketOpeningLimitsSchema => {
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? computedPocket.boundingRect.width : computedPocket.boundingRect.height
  const marginWidth = BigNumber.maximum(width.minus(POSITION_EPSILON), 0)
  const startMarginMaximum = getSharedLengthMaximum(new BigNumber(opening.recessEndMargin), marginWidth)
  const endMarginMaximum = getSharedLengthMaximum(new BigNumber(opening.recessStartMargin), marginWidth)
  const startMargin = clamp(opening.recessStartMargin, 0, startMarginMaximum).toNumber()
  const endMargin = clamp(opening.recessEndMargin, 0, endMarginMaximum).toNumber()
  const openingWidth = width.minus(startMargin).minus(endMargin)
  const halfWidth = openingWidth.dividedBy(2)
  const innerOffsetMaximum: NumericBoundSchema = {
    value: halfWidth,
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
  const adjusted: RecessedPocketOpeningSchema = {
    ...opening,
    recessStartMargin: startMargin,
    recessEndMargin: endMargin,
    recessInnerOffset: clamp(opening.recessInnerOffset, 0, innerOffsetMaximum.value).toNumber(),
  }
  const outerInsetMaximum: NumericBoundSchema = {
    value: halfWidth.minus(adjusted.recessInnerOffset),
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
  adjusted.recessOuterInset = clamp(opening.recessOuterInset, 0, outerInsetMaximum.value).toNumber()

  let depthMaximum: NumericBoundSchema
  if (narrowers.is.computedFrontPocket(computedPocket)) {
    depthMaximum = getFrontPocketDepthMaximum(adjusted, computedPocket, pocketCluster.orientation)
  } else if (narrowers.is.tPocket(sourcePocket)) {
    depthMaximum = getTPocketDepthMaximum(adjusted, computedPocket, pocketCluster, sourcePocket)
  } else {
    depthMaximum = { value: new BigNumber(0), reason: 'pocket-opening-boundary', severity: 'warning' }
  }
  const limits: RecessedPocketOpeningLimitsSchema = {
    type: 'recessed',
    recessStartMargin: {
      max: { value: startMarginMaximum, reason: 'recessed-pocket-opening-margins-share-width', severity: 'warning' },
    },
    recessEndMargin: {
      max: { value: endMarginMaximum, reason: 'recessed-pocket-opening-margins-share-width', severity: 'warning' },
    },
    recessInnerOffset: { max: innerOffsetMaximum },
    recessOuterInset: { max: outerInsetMaximum },
    recessDepth: { max: depthMaximum },
  }
  adjusted.recessDepth = clamp(opening.recessDepth, 0, depthMaximum.value).toNumber()
  if (adjusted.recessDepth === 0) {
    return limits
  }

  const innerRadiusMaximum = getInnerRadiusMaximum(adjusted, openingWidth)
  limits.recessInnerRadius = { max: innerRadiusMaximum }
  adjusted.recessInnerRadius = clamp(opening.recessInnerRadius, 0, innerRadiusMaximum.value).toNumber()

  limits.recessOuterRadius = { max: getOuterRadiusMaximum(adjusted, computedPocket, pocketCluster, sourcePocket) }
  return limits
}

const getFrontPocketDepthMaximum = (
  opening: RecessedPocketOpeningSchema,
  pocket: ComputedFrontPocketSchema,
  orientation: PocketOrientationSchema,
): NumericBoundSchema => {
  const isVertical = orientation === 'up' || orientation === 'down'
  const width = isVertical ? pocket.boundingRect.width : pocket.boundingRect.height
  const pocketDepth = isVertical ? pocket.boundingRect.height : pocket.boundingRect.width
  const openingWidth = width.minus(opening.recessStartMargin).minus(opening.recessEndMargin)
  const innerCornerX = openingWidth.dividedBy(2).minus(opening.recessInnerOffset)
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
      closedCornerRadii = [radius.topRight, radius.topLeft]
      break
    case 'left':
      closedCornerRadii = [radius.bottomRight, radius.topRight]
      break
    case 'right':
      closedCornerRadii = [radius.topLeft, radius.bottomLeft]
      break
  }
  const margins = [opening.recessStartMargin, opening.recessEndMargin]
  for (const [index, cornerRadius] of closedCornerRadii.entries()) {
    const distanceFromEdge = innerCornerX.plus(margins[index])
    if (distanceFromEdge.isGreaterThanOrEqualTo(cornerRadius)) {
      continue
    }
    const availableDepth = pocketDepth
      .minus(cornerRadius)
      .plus(BigNumber.maximum(cornerRadius.pow(2).minus(cornerRadius.minus(distanceFromEdge).pow(2)), 0).sqrt())
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
  sourcePocket: TPocketSchema,
): NumericBoundSchema => {
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? pocket.boundingRect.width : pocket.boundingRect.height
  const pocketDepth = isVertical ? pocket.boundingRect.height : pocket.boundingRect.width
  const tabDepth = getTPocketTabDepth(pocketCluster, pocket.boundingRect)
  const tabWidth = new BigNumber(sourcePocket.tPocketTabWidth).plus(POSITION_EPSILON)
  const taper = new BigNumber(sourcePocket.tPocketTaper).plus(POSITION_EPSILON)
  const openingWidth = width.minus(opening.recessStartMargin).minus(opening.recessEndMargin)
  const innerCornerX = openingWidth.dividedBy(2).minus(opening.recessInnerOffset)
  let maximum: NumericBoundSchema = {
    value: BigNumber.maximum(pocketDepth.minus(1), 0),
    reason: 'pocket-opening-depth',
    severity: 'warning',
  }
  if (maximum.value.isLessThan(tabDepth)) {
    return maximum
  }

  // Above the shoulder the full width is available. Below it, the unrounded side must
  // clear the shoulder endpoint and its bottom corner must clear the tapered edge.
  let boundaryMaximum = maximum.value
  const aboveShoulderMaximum = BigNumber.maximum(tabDepth.minus(POSITION_EPSILON), 0)
  for (const margin of [opening.recessStartMargin, opening.recessEndMargin]) {
    const outerCornerFromEdge = new BigNumber(margin).plus(opening.recessOuterInset)
    const innerCornerFromEdge = innerCornerX.plus(margin)
    if (tabWidth.isGreaterThan(outerCornerFromEdge)) {
      const shoulderMaximum = innerCornerFromEdge
        .minus(outerCornerFromEdge)
        .times(tabDepth)
        .dividedBy(tabWidth.minus(outerCornerFromEdge))
      boundaryMaximum = BigNumber.minimum(boundaryMaximum, BigNumber.maximum(aboveShoulderMaximum, shoulderMaximum))
    }
    if (taper.isGreaterThan(tabWidth)) {
      const taperMaximum = tabDepth.plus(
        pocketDepth.minus(tabDepth).times(innerCornerFromEdge.minus(tabWidth)).dividedBy(taper.minus(tabWidth)),
      )
      boundaryMaximum = BigNumber.minimum(boundaryMaximum, BigNumber.maximum(aboveShoulderMaximum, taperMaximum))
    }
  }
  if (boundaryMaximum.isLessThan(maximum.value)) {
    maximum = { value: boundaryMaximum, reason: 'pocket-opening-boundary', severity: 'warning' }
  }
  return maximum
}

const getInnerRadiusMaximum = (opening: RecessedPocketOpeningSchema, openingWidth: BigNumber): NumericBoundSchema => {
  const horizontalDistance = openingWidth.dividedBy(2).minus(opening.recessInnerOffset).minus(opening.recessOuterInset)
  const depth = new BigNumber(opening.recessDepth)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  return {
    value: new BigNumber(opening.recessInnerOffset).dividedBy(angleFactor),
    reason: 'pocket-opening-width',
    severity: 'warning',
  }
}

const getOuterRadiusMaximum = (
  opening: RecessedPocketOpeningSchema,
  pocket: ComputedFrontPocketSchema | ComputedTPocketSchema,
  pocketCluster: PocketClusterSchema,
  sourcePocket: PocketSchema,
): NumericBoundSchema => {
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = (isVertical ? pocket.boundingRect.width : pocket.boundingRect.height)
    .minus(opening.recessStartMargin)
    .minus(opening.recessEndMargin)
  const horizontalDistance = width.dividedBy(2).minus(opening.recessInnerOffset).minus(opening.recessOuterInset)
  const depth = new BigNumber(opening.recessDepth)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  const availableTop = new BigNumber(opening.recessOuterInset)
  const separatedMaximum = availableTop.dividedBy(angleFactor)
  const innerEndX = width
    .dividedBy(2)
    .minus(opening.recessInnerOffset)
    .plus(new BigNumber(opening.recessInnerRadius).times(angleFactor))
  let upperBound = separatedMaximum
  if (separatedMaximum.plus(opening.recessInnerRadius).times(angleFactor).isGreaterThan(sideLength)) {
    upperBound = innerEndX.pow(2).plus(depth.pow(2)).dividedBy(depth.times(2)).minus(opening.recessInnerRadius)
  }
  upperBound = BigNumber.maximum(upperBound, 0)
  const maximum: NumericBoundSchema = { value: upperBound, reason: 'pocket-opening-width', severity: 'warning' }
  if (narrowers.is.computedFrontPocket(pocket) || !narrowers.is.tPocket(sourcePocket)) {
    return maximum
  }
  const tabDepth = getTPocketTabDepth(pocketCluster, pocket.boundingRect)
  if (depth.isLessThanOrEqualTo(tabDepth)) {
    return maximum
  }
  const tabWidth = new BigNumber(sourcePocket.tPocketTabWidth).plus(POSITION_EPSILON)
  const minimumMargin = BigNumber.minimum(opening.recessStartMargin, opening.recessEndMargin)
  if (
    getOuterTransitionX({ ...opening, recessOuterRadius: upperBound.toNumber() }, width, tabDepth)
      .plus(minimumMargin)
      .isGreaterThanOrEqualTo(tabWidth)
  ) {
    return maximum
  }

  // With the inner circle fixed, increasing the outer radius only moves this boundary
  // outward. The valid interval starts at zero, so bisection cannot skip a valid range.
  let lowerBound = new BigNumber(0)
  while (upperBound.minus(lowerBound).isGreaterThan(OUTER_RADIUS_SEARCH_PRECISION)) {
    const candidate = upperBound.plus(lowerBound).dividedBy(2)
    const candidateOpening: RecessedPocketOpeningSchema = { ...opening, recessOuterRadius: candidate.toNumber() }
    if (getOuterTransitionX(candidateOpening, width, tabDepth).plus(minimumMargin).isGreaterThanOrEqualTo(tabWidth)) {
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
  const depth = new BigNumber(opening.recessDepth)
  const horizontalDistance = openingWidth.dividedBy(2).minus(opening.recessInnerOffset).minus(opening.recessOuterInset)
  const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
  const outerRadius = new BigNumber(opening.recessOuterRadius)
  const innerRadius = new BigNumber(opening.recessInnerRadius)
  const innerEndX = openingWidth.dividedBy(2).minus(opening.recessInnerOffset).plus(innerRadius.times(angleFactor))
  const remainingDepth = depth.minus(distanceFromOpening)
  let outerStartX: BigNumber
  let outerEndDepth: BigNumber

  if (outerRadius.plus(innerRadius).times(angleFactor).isLessThan(sideLength)) {
    const oneMinusCosine = angleFactor.pow(2).times(2).dividedBy(angleFactor.pow(2).plus(1))
    outerStartX = new BigNumber(opening.recessOuterInset).minus(outerRadius.times(angleFactor))
    outerEndDepth = outerRadius.times(oneMinusCosine)
    if (
      distanceFromOpening.isGreaterThanOrEqualTo(outerEndDepth) &&
      remainingDepth.isGreaterThan(innerRadius.times(oneMinusCosine))
    ) {
      return new BigNumber(opening.recessOuterInset).plus(
        horizontalDistance.times(distanceFromOpening).dividedBy(depth),
      )
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
