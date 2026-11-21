import type { HasStretchSchema } from '../schemas/common'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'
import { getStretchLimits } from './limits/getStretchLimits'

export const applyStretchToBoundingBox = (stretch: HasStretchSchema, boundingBox: RectSchema): RectSchema => {
  const limits = getStretchLimits(stretch, boundingBox)
  const leftStretch = clamp(stretch.leftStretch, limits.leftStretch.min?.value)
  const rightStretch = clamp(stretch.rightStretch, limits.rightStretch.min?.value)
  const topStretch = clamp(stretch.topStretch, limits.topStretch.min?.value)
  const bottomStretch = clamp(stretch.bottomStretch, limits.bottomStretch.min?.value)

  return {
    x: boundingBox.x.minus(leftStretch),
    y: boundingBox.y.minus(topStretch),
    width: boundingBox.width.plus(leftStretch).plus(rightStretch),
    height: boundingBox.height.plus(topStretch).plus(bottomStretch),
  }
}
