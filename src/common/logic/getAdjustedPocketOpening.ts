import BigNumber from 'bignumber.js'

import type {
  PocketOpeningOwnSchema,
  PocketOrientationSchema,
  RecessedPocketOpeningSchema,
} from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

export const getAdjustedPocketOpening = (
  opening: PocketOpeningOwnSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
  openingCornerRadius: BigNumber,
): PocketOpeningOwnSchema => {
  switch (opening.type) {
    case 'straight':
      return opening
    case 'recessed':
      return getAdjustedRecessedPocketOpening(opening, pocketRect, orientation, openingCornerRadius)
  }
}

const getAdjustedRecessedPocketOpening = (
  opening: RecessedPocketOpeningSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
  openingCornerRadius: BigNumber,
): RecessedPocketOpeningSchema => {
  const isVertical = orientation === 'up' || orientation === 'down'
  const halfWidth = (isVertical ? pocketRect.width : pocketRect.height).dividedBy(2)
  const pocketDepth = isVertical ? pocketRect.height : pocketRect.width
  const outerInset = clamp(opening.outerInset, openingCornerRadius, halfWidth)
  const innerInset = clamp(opening.innerInset, BigNumber.maximum(openingCornerRadius, outerInset), halfWidth)
  const depth = clamp(opening.depth, 0, pocketDepth)
  const outerToInnerDistance = innerInset.minus(outerInset)
  const sideLength = outerToInnerDistance.pow(2).plus(depth.pow(2)).sqrt()
  const angleFactor = depth.isZero() ? new BigNumber(0) : depth.dividedBy(sideLength.plus(outerToInnerDistance))
  let outerRadius = BigNumber.maximum(opening.outerRadius, 0)
  let innerRadius = BigNumber.maximum(opening.innerRadius, 0)

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
