import BigNumber from 'bignumber.js'

import { cards } from '../data/cards'
import type { PocketClusterSchema } from '../schemas/components'
import type { ComputedCardSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { CardSchema } from '../schemas/valuables'
import { isDefined } from '../utils/isDefined'
import { calculateRectPath } from './calculateRectPath'

export const calculatePocketCard = (
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): ComputedCardSchema | undefined => {
  if (!isDefined(pocketCluster.cardId)) {
    return undefined
  }

  const card = cards.find((candidateCard) => candidateCard.id === pocketCluster.cardId)

  if (!isDefined(card)) {
    throw new Error(`Card not found: ${pocketCluster.cardId}`)
  }

  const boundingRect = getCardBoundingRect(card, pocketCluster, pocketBoundingRect)

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
  card: CardSchema,
  pocketCluster: PocketClusterSchema,
  pocketBoundingRect: RectSchema,
): RectSchema => {
  const isOpeningVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const cardWidth = new BigNumber(isOpeningVertical ? card.width : card.height)
  const cardHeight = new BigNumber(isOpeningVertical ? card.height : card.width)
  const horizontallyCenteredX = pocketBoundingRect.x.plus(pocketBoundingRect.width.minus(cardWidth).dividedBy(2))
  const verticallyCenteredY = pocketBoundingRect.y.plus(pocketBoundingRect.height.minus(cardHeight).dividedBy(2))

  switch (pocketCluster.orientation) {
    case 'up':
      return {
        x: horizontallyCenteredX.plus(pocketCluster.cardCrossAxisOffset),
        y: pocketBoundingRect.y
          .plus(pocketBoundingRect.height)
          .minus(cardHeight)
          .minus(pocketCluster.cardOpeningOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'down':
      return {
        x: horizontallyCenteredX.plus(pocketCluster.cardCrossAxisOffset),
        y: pocketBoundingRect.y.plus(pocketCluster.cardOpeningOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'left':
      return {
        x: pocketBoundingRect.x.plus(pocketBoundingRect.width).minus(cardWidth).minus(pocketCluster.cardOpeningOffset),
        y: verticallyCenteredY.plus(pocketCluster.cardCrossAxisOffset),
        width: cardWidth,
        height: cardHeight,
      }
    case 'right':
      return {
        x: pocketBoundingRect.x.plus(pocketCluster.cardOpeningOffset),
        y: verticallyCenteredY.plus(pocketCluster.cardCrossAxisOffset),
        width: cardWidth,
        height: cardHeight,
      }
  }
}
