import BigNumber from 'bignumber.js'

import { ZERO_CORNER_RADIUS } from '../constants/layout'
import { pocketItems } from '../data/pocketItems'
import type { PocketClusterSchema, PocketSchema } from '../schemas/components'
import type { ComputedPocketItemSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { PocketItemSchema } from '../schemas/pocketItem'
import { isDefined } from '../utils/isDefined'
import { calculateRectPath } from './calculateRectPath'

export const calculatePocketItem = (
  pocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): ComputedPocketItemSchema | undefined => {
  if (!isDefined(pocket.itemId)) {
    return undefined
  }

  const item = pocketItems[pocket.itemId]

  if (!isDefined(item)) {
    throw new Error(`Pocket item not found: ${pocket.itemId}`)
  }

  const boundingRect = getItemBoundingRect(item, pocket, pocketCluster, pocketBoundingRect)

  const cornerRadius: CornerRadiusSchema =
    item.type === 'card'
      ? {
          topLeft: new BigNumber(item.radius),
          topRight: new BigNumber(item.radius),
          bottomRight: new BigNumber(item.radius),
          bottomLeft: new BigNumber(item.radius),
        }
      : ZERO_CORNER_RADIUS

  return {
    type: 'computed-pocket-item',
    item,
    boundingRect,
    cornerRadius,
    path: calculateRectPath(boundingRect, cornerRadius),
  }
}

const getItemBoundingRect = (
  item: PocketItemSchema,
  pocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): RectSchema => {
  const itemWidth = new BigNumber(pocket.itemOrientation === 'landscape' ? item.width : item.height)
  const itemHeight = new BigNumber(pocket.itemOrientation === 'landscape' ? item.height : item.width)
  const horizontallyCenteredX = pocketBoundingRect.x.plus(pocketBoundingRect.width.minus(itemWidth).dividedBy(2))
  const verticallyCenteredY = pocketBoundingRect.y.plus(pocketBoundingRect.height.minus(itemHeight).dividedBy(2))

  switch (pocketCluster.orientation) {
    case 'up':
      return {
        x: horizontallyCenteredX.plus(pocket.itemCrossAxisOffset),
        y: pocketBoundingRect.y.plus(pocketBoundingRect.height).minus(itemHeight).minus(pocket.itemOpeningOffset),
        width: itemWidth,
        height: itemHeight,
      }
    case 'down':
      return {
        x: horizontallyCenteredX.plus(pocket.itemCrossAxisOffset),
        y: pocketBoundingRect.y.plus(pocket.itemOpeningOffset),
        width: itemWidth,
        height: itemHeight,
      }
    case 'left':
      return {
        x: pocketBoundingRect.x.plus(pocketBoundingRect.width).minus(itemWidth).minus(pocket.itemOpeningOffset),
        y: verticallyCenteredY.plus(pocket.itemCrossAxisOffset),
        width: itemWidth,
        height: itemHeight,
      }
    case 'right':
      return {
        x: pocketBoundingRect.x.plus(pocket.itemOpeningOffset),
        y: verticallyCenteredY.plus(pocket.itemCrossAxisOffset),
        width: itemWidth,
        height: itemHeight,
      }
  }
}
