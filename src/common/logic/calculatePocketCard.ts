import BigNumber from 'bignumber.js'

import { cards } from '../data/cards'
import type { PocketClusterSchema, PocketSchema } from '../schemas/components'
import type { ComputedCardSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { CardPocketItemSchema } from '../schemas/pocketItem'
import { isDefined } from '../utils/isDefined'
import { calculateRectPath } from './calculateRectPath'

export const calculatePocketCard = (
  pocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): ComputedCardSchema | undefined => {
  if (!isDefined(pocket.pocketItemId)) {
    return undefined
  }

  const card = cards.find((candidateCard) => candidateCard.id === pocket.pocketItemId)

  if (!isDefined(card)) {
    throw new Error(`Card not found: ${pocket.pocketItemId}`)
  }

  const boundingRect = getCardBoundingRect(card, pocket, pocketCluster, pocketBoundingRect)

  const cornerRadius: CornerRadiusSchema = {
    topLeft: new BigNumber(card.radius),
    topRight: new BigNumber(card.radius),
    bottomRight: new BigNumber(card.radius),
    bottomLeft: new BigNumber(card.radius),
  }

  return {
    type: 'computed-card',
    card,
    boundingRect,
    cornerRadius,
    path: calculateRectPath(boundingRect, cornerRadius),
  }
}

const getCardBoundingRect = (
  card: CardPocketItemSchema,
  pocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): RectSchema => {
  const cardWidth = new BigNumber(pocket.pocketItemOrientation === 'landscape' ? card.width : card.height)
  const cardHeight = new BigNumber(pocket.pocketItemOrientation === 'landscape' ? card.height : card.width)
  const horizontallyCenteredX = pocketBoundingRect.x.plus(pocketBoundingRect.width.minus(cardWidth).dividedBy(2))
  const verticallyCenteredY = pocketBoundingRect.y.plus(pocketBoundingRect.height.minus(cardHeight).dividedBy(2))

  switch (pocketCluster.orientation) {
    case 'up':
      return {
        x: horizontallyCenteredX.plus(pocket.pocketItemCrossAxisOffset),
        y: pocketBoundingRect.y.plus(pocketBoundingRect.height).minus(cardHeight).minus(pocket.pocketItemOpeningOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'down':
      return {
        x: horizontallyCenteredX.plus(pocket.pocketItemCrossAxisOffset),
        y: pocketBoundingRect.y.plus(pocket.pocketItemOpeningOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'left':
      return {
        x: pocketBoundingRect.x.plus(pocketBoundingRect.width).minus(cardWidth).minus(pocket.pocketItemOpeningOffset),
        y: verticallyCenteredY.plus(pocket.pocketItemCrossAxisOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'right':
      return {
        x: pocketBoundingRect.x.plus(pocket.pocketItemOpeningOffset),
        y: verticallyCenteredY.plus(pocket.pocketItemCrossAxisOffset),
        width: cardWidth,
        height: cardHeight,
      }
  }
}
