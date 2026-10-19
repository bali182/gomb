import BigNumber from 'bignumber.js'
import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { CornerRadiusSchema, RectSchema } from '../../schemas/geometry'
import type { CornerRadiusLimitsSchema, NumericBoundSchema, NumericFieldLimitsSchema } from '../../schemas/limits'
import { isDefined } from '../../utils/isDefined'

export type GetCornerRadiusLimitsParams = {
  boundingRect: RectSchema
  cornerRadius: CornerRadiusSchema
  parentBoundingRect?: RectSchema
  parentCornerRadius?: CornerRadiusSchema
}

/**
 * Parent minima are applied before neighbouring corners compete for an edge.
 * An edge gives half its length when the other radius exceeds the guaranteed
 * radius, otherwise it gives the space left by that radius. Unlike the former
 * adjustment cap, this reports a real maximum even for currently small radii.
 * Geometric maxima take precedence over parent minima.
 */
export const getCornerRadiusLimits = ({
  boundingRect,
  cornerRadius,
  parentBoundingRect,
  parentCornerRadius,
}: GetCornerRadiusLimitsParams): CornerRadiusLimitsSchema => {
  const minimum = getParentMinimum(boundingRect, parentBoundingRect, parentCornerRadius)
  const radius: CornerRadiusSchema = {
    topLeft: BigNumber.maximum(cornerRadius.topLeft, minimum.topLeft),
    topRight: BigNumber.maximum(cornerRadius.topRight, minimum.topRight),
    bottomLeft: BigNumber.maximum(cornerRadius.bottomLeft, minimum.bottomLeft),
    bottomRight: BigNumber.maximum(cornerRadius.bottomRight, minimum.bottomRight),
  }
  const guaranteedRadius = BigNumber.maximum(BigNumber.minimum(boundingRect.width, boundingRect.height), 0).div(2)
  return {
    topLeftRadius: getCornerLimits(
      minimum.topLeft,
      getEdgeMaximum(radius.topRight, boundingRect.width, guaranteedRadius),
      getEdgeMaximum(radius.bottomLeft, boundingRect.height, guaranteedRadius),
    ),
    topRightRadius: getCornerLimits(
      minimum.topRight,
      getEdgeMaximum(radius.topLeft, boundingRect.width, guaranteedRadius),
      getEdgeMaximum(radius.bottomRight, boundingRect.height, guaranteedRadius),
    ),
    bottomLeftRadius: getCornerLimits(
      minimum.bottomLeft,
      getEdgeMaximum(radius.bottomRight, boundingRect.width, guaranteedRadius),
      getEdgeMaximum(radius.topLeft, boundingRect.height, guaranteedRadius),
    ),
    bottomRightRadius: getCornerLimits(
      minimum.bottomRight,
      getEdgeMaximum(radius.bottomLeft, boundingRect.width, guaranteedRadius),
      getEdgeMaximum(radius.topRight, boundingRect.height, guaranteedRadius),
    ),
  }
}

const getParentMinimum = (
  rect: RectSchema,
  parent: RectSchema | undefined,
  radius: CornerRadiusSchema | undefined,
): CornerRadiusSchema => {
  if (!isDefined(parent) || !isDefined(radius)) {
    return ZERO_CORNER_RADIUS
  }
  const touchesLeft = rect.x.eq(parent.x)
  const touchesRight = rect.x.plus(rect.width).eq(parent.x.plus(parent.width))
  const touchesTop = rect.y.eq(parent.y)
  const touchesBottom = rect.y.plus(rect.height).eq(parent.y.plus(parent.height))
  return {
    topLeft: touchesLeft && touchesTop ? radius.topLeft : ZERO_CORNER_RADIUS.topLeft,
    topRight: touchesRight && touchesTop ? radius.topRight : ZERO_CORNER_RADIUS.topRight,
    bottomLeft: touchesLeft && touchesBottom ? radius.bottomLeft : ZERO_CORNER_RADIUS.bottomLeft,
    bottomRight: touchesRight && touchesBottom ? radius.bottomRight : ZERO_CORNER_RADIUS.bottomRight,
  }
}

const getEdgeMaximum = (
  otherRadius: BigNumber,
  length: BigNumber,
  guaranteedRadius: BigNumber,
): NumericBoundSchema => ({
  value: BigNumber.maximum(otherRadius.gt(guaranteedRadius) ? length.div(2) : length.minus(otherRadius), 0),
  reason: otherRadius.isZero() ? 'corner-radius-exceeds-edge-length' : 'corner-radii-share-edge',
  severity: 'warning',
})

const getCornerLimits = (
  parentMinimum: BigNumber,
  horizontalMaximum: NumericBoundSchema,
  verticalMaximum: NumericBoundSchema,
): NumericFieldLimitsSchema => {
  const max = verticalMaximum.value.lt(horizontalMaximum.value) ? verticalMaximum : horizontalMaximum
  return {
    min: parentMinimum.gt(0)
      ? { value: BigNumber.minimum(parentMinimum, max.value), reason: 'parent-corner-radius', severity: 'info' }
      : undefined,
    max,
  }
}
