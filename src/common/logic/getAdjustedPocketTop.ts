import BigNumber from 'bignumber.js'

import type { PocketOrientationSchema, PocketTopOwnSchema, RecessedPocketTopSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

export const getAdjustedPocketTop = (
  pocketTop: PocketTopOwnSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
  openingCornerRadius: BigNumber,
): PocketTopOwnSchema => {
  switch (pocketTop.type) {
    case 'straight':
      return pocketTop
    case 'recessed':
      return getAdjustedRecessedPocketTop(pocketTop, pocketRect, orientation, openingCornerRadius)
  }
}

const getAdjustedRecessedPocketTop = (
  pocketTop: RecessedPocketTopSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
  openingCornerRadius: BigNumber,
): RecessedPocketTopSchema => {
  const isVertical = orientation === 'up' || orientation === 'down'
  const halfWidth = (isVertical ? pocketRect.width : pocketRect.height).dividedBy(2)
  const pocketDepth = isVertical ? pocketRect.height : pocketRect.width
  const outerInset = clamp(pocketTop.outerInset, openingCornerRadius, halfWidth)
  const innerInset = clamp(pocketTop.innerInset, BigNumber.maximum(openingCornerRadius, outerInset), halfWidth)
  const depth = clamp(pocketTop.depth, 0, pocketDepth)
  const outerToInnerDistance = innerInset.minus(outerInset)
  const sideLength = outerToInnerDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.isZero() ? new BigNumber(0) : depth.dividedBy(sideLength.plus(outerToInnerDistance))
  let outerRadius = BigNumber.maximum(pocketTop.outerRadius, 0)
  let innerRadius = BigNumber.maximum(pocketTop.innerRadius, 0)

  if (angleFactor.isZero()) {
    outerRadius = new BigNumber(0)
    innerRadius = new BigNumber(0)
  } else {
    let outerLength = BigNumber.minimum(
      outerRadius.times(angleFactor),
      BigNumber.maximum(outerInset.minus(openingCornerRadius), 0),
    )
    let innerLength = BigNumber.minimum(innerRadius.times(angleFactor), halfWidth.minus(innerInset))
    const halfSide = sideLength.dividedBy(2)

    if (outerLength.plus(innerLength).isGreaterThan(sideLength)) {
      if (outerLength.isGreaterThan(halfSide) && innerLength.isGreaterThan(halfSide)) {
        outerLength = halfSide
        innerLength = halfSide
      } else if (outerLength.isGreaterThan(halfSide)) {
        outerLength = sideLength.minus(innerLength)
      } else {
        innerLength = sideLength.minus(outerLength)
      }
    }

    outerRadius = outerLength.dividedBy(angleFactor)
    innerRadius = innerLength.dividedBy(angleFactor)
  }

  return {
    type: 'recessed',
    outerInset: outerInset.toNumber(),
    innerInset: innerInset.toNumber(),
    depth: depth.toNumber(),
    outerRadius: outerRadius.toNumber(),
    innerRadius: innerRadius.toNumber(),
  }
}
