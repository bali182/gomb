import BigNumber from 'bignumber.js'
import {
  STITCH_ROUTE_LABEL_HORIZONTAL_PADDING,
  STITCH_ROUTE_LABEL_ICON_GAP,
  STITCH_ROUTE_LABEL_VERTICAL_PADDING,
} from '../../constants/drawing'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { PointSchema, RectSchema } from '../../schemas/geometry'

export const STITCH_ROUTE_LABEL_OFFSET = new BigNumber(3)

export const getBackgroundBounds = (textBounds: RectSchema): RectSchema => {
  const iconSize = textBounds.height

  return {
    x: textBounds.x.minus(iconSize).minus(STITCH_ROUTE_LABEL_ICON_GAP).minus(STITCH_ROUTE_LABEL_HORIZONTAL_PADDING),
    y: textBounds.y.minus(STITCH_ROUTE_LABEL_VERTICAL_PADDING),
    width: textBounds.width
      .plus(iconSize)
      .plus(STITCH_ROUTE_LABEL_ICON_GAP)
      .plus(STITCH_ROUTE_LABEL_HORIZONTAL_PADDING * 2),
    height: textBounds.height.plus(STITCH_ROUTE_LABEL_VERTICAL_PADDING * 2),
  }
}

export const getIconPosition = (textBounds: RectSchema): PointSchema => ({
  x: textBounds.x.minus(textBounds.height).minus(STITCH_ROUTE_LABEL_ICON_GAP),
  y: textBounds.y,
})

export const getLabelPosition = (route: ComputedStitchRouteSchema, backgroundBounds: RectSchema): PointSchema => {
  const { boundingRect } = route
  const right = boundingRect.x.plus(boundingRect.width)
  const bottom = boundingRect.y.plus(boundingRect.height)
  const centerX = boundingRect.x.plus(right).dividedBy(2)
  const centerY = boundingRect.y.plus(bottom).dividedBy(2)
  const backgroundCenterX = backgroundBounds.x.plus(backgroundBounds.width.dividedBy(2))
  const backgroundCenterY = backgroundBounds.y.plus(backgroundBounds.height.dividedBy(2))

  switch (route.labelPosition) {
    case 'top':
      return {
        x: centerX.minus(backgroundCenterX),
        y: boundingRect.y.plus(STITCH_ROUTE_LABEL_OFFSET).minus(backgroundBounds.y),
      }
    case 'right':
      return {
        x: right.minus(STITCH_ROUTE_LABEL_OFFSET).minus(backgroundBounds.x).minus(backgroundBounds.width),
        y: centerY.minus(backgroundCenterY),
      }
    case 'bottom':
      return {
        x: centerX.minus(backgroundCenterX),
        y: bottom.minus(STITCH_ROUTE_LABEL_OFFSET).minus(backgroundBounds.y).minus(backgroundBounds.height),
      }
    case 'left':
      return {
        x: boundingRect.x.plus(STITCH_ROUTE_LABEL_OFFSET).minus(backgroundBounds.x),
        y: centerY.minus(backgroundCenterY),
      }
  }
}
