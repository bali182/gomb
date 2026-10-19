import type { PocketsSchema } from '../../schemas/components'
import type { RectSchema } from '../../schemas/geometry'
import type { PocketsLimitsSchema } from '../../schemas/limits'

export const getPocketsLimits = (pockets: PocketsSchema, boundingRect: RectSchema): PocketsLimitsSchema => {
  const isVertical = pockets.orientation === 'up' || pockets.orientation === 'down'
  const stackLength = isVertical ? boundingRect.height : boundingRect.width
  const crossSize = isVertical ? boundingRect.width : boundingRect.height
  const halfCrossSize = crossSize.dividedBy(2)
  return {
    pocketStep: {
      max: {
        value: stackLength.dividedBy(pockets.pocketCount),
        reason: 'cluster-size-and-pocket-count',
        severity: 'warning',
      },
    },
    tPocketTabWidth: {
      max: {
        value: halfCrossSize,
        reason: 't-pocket-tab-width-exceeds-half-width',
        severity: 'warning',
      },
    },
    tPocketTaper: {
      max: {
        value: halfCrossSize,
        reason: 't-pocket-taper-exceeds-half-width',
        severity: 'warning',
      },
    },
  }
}
