import BigNumber from 'bignumber.js'
import { POSITION_EPSILON } from '../constants/layout'
import type { AnchorSchema, HasAnchorsSchema, HasAutoDimensionsSchema, HasXYOffsetSchema } from '../schemas/common'
import type { RectSchema } from '../schemas/geometry'

export const calculateAnchoredBoundingRect = (
  model: HasAnchorsSchema & HasXYOffsetSchema & HasAutoDimensionsSchema,
  ownerBoundingRect: RectSchema,
): RectSchema => {
  const width = BigNumber.maximum(model.autoWidth ? ownerBoundingRect.width : model.width, POSITION_EPSILON)
  const height = BigNumber.maximum(model.autoHeight ? ownerBoundingRect.height : model.height, POSITION_EPSILON)
  return {
    x: calculateAnchoredAxisStart(ownerBoundingRect.x, ownerBoundingRect.width, width, model.xAnchor, model.xOffset),
    y: calculateAnchoredAxisStart(ownerBoundingRect.y, ownerBoundingRect.height, height, model.yAnchor, model.yOffset),
    width,
    height,
  }
}

const calculateAnchoredAxisStart = (
  ownerStart: BigNumber,
  ownerLength: BigNumber,
  elementLength: BigNumber,
  anchor: AnchorSchema,
  offset: number,
): BigNumber => {
  switch (anchor) {
    case 'start':
      return ownerStart.plus(offset)
    case 'middle':
      return ownerStart.plus(ownerLength.dividedBy(2)).plus(offset).minus(elementLength.dividedBy(2))
    case 'end':
      return ownerStart.plus(ownerLength).minus(offset).minus(elementLength)
  }
}
