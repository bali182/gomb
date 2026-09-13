import BigNumber from 'bignumber.js'

import { ZERO } from '../constants/layout'
import type { PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

type CalculateLayoutBoundingBoxesParams = {
  component: RootPanelSchema | PanelSchema
  children: (PanelSchema | PocketClusterSchema)[]
  computedGap: BigNumber
  boundingRect: RectSchema
}

type LayoutBoundingBox = {
  boundingRect: RectSchema
  layoutBoundingRect: RectSchema
}

export const calculateLayoutBoundingBoxes = (
  params: CalculateLayoutBoundingBoxesParams,
): Record<string, LayoutBoundingBox> => {
  switch (params.component.layoutOrientation) {
    case 'horizontal':
      return calculateHorizontalDefaultBoundingBoxes(params)
    case 'vertical':
      return calculateVerticalDefaultBoundingBoxes(params)
  }
}

const calculateHorizontalDefaultBoundingBoxes = ({
  component,
  children,
  computedGap,
  boundingRect,
}: CalculateLayoutBoundingBoxesParams): Record<string, LayoutBoundingBox> => {
  const widths = calculateMainAxisSizes(children, boundingRect, component, computedGap)
  let nextLeft = boundingRect.x
  const boundingBoxes: Record<string, LayoutBoundingBox> = {}

  for (const child of children) {
    const width = widths[child.id]
    const height = calculateCrossAxisSize(child, boundingRect, component)
    const y = calculateHorizontalCrossAxisPosition(boundingRect, child, height)

    const boundingBox: RectSchema = {
      x: nextLeft,
      y,
      width,
      height,
    }

    nextLeft = nextLeft.plus(width).plus(computedGap)

    boundingBoxes[child.id] = {
      boundingRect: applySqueezeToBoundingBox(child, boundingBox, boundingRect),
      layoutBoundingRect: boundingBox,
    }
  }

  return boundingBoxes
}

const calculateVerticalDefaultBoundingBoxes = ({
  component,
  children,
  computedGap,
  boundingRect,
}: CalculateLayoutBoundingBoxesParams): Record<string, LayoutBoundingBox> => {
  const heights = calculateMainAxisSizes(children, boundingRect, component, computedGap)
  let nextTop = boundingRect.y
  const boundingBoxes: Record<string, LayoutBoundingBox> = {}

  for (const child of children) {
    const width = calculateCrossAxisSize(child, boundingRect, component)
    const height = heights[child.id]
    const x = calculateVerticalCrossAxisPosition(boundingRect, child, width)

    const boundingBox: RectSchema = {
      x,
      y: nextTop,
      width,
      height,
    }

    nextTop = nextTop.plus(height).plus(computedGap)

    boundingBoxes[child.id] = {
      boundingRect: applySqueezeToBoundingBox(child, boundingBox, boundingRect),
      layoutBoundingRect: boundingBox,
    }
  }

  return boundingBoxes
}

const calculateMainAxisSizes = (
  children: (PanelSchema | PocketClusterSchema)[],
  parentBoundingBox: RectSchema,
  parent: RootPanelSchema | PanelSchema,
  computedGap: BigNumber,
): Record<string, BigNumber> => {
  const parentSpace = parent.layoutOrientation === 'horizontal' ? parentBoundingBox.width : parentBoundingBox.height
  const gapSpace = BigNumber.maximum(new BigNumber(children.length).minus(1), ZERO).times(computedGap)
  const sizesById: Record<string, BigNumber> = {}

  for (const child of children) {
    if (isMainAxisAuto(child, parent)) {
      continue
    }

    sizesById[child.id] = clamp(getMainAxisSize(child, parent), ZERO, parentSpace)
  }

  const fixedComponentSpace = Object.values(sizesById).reduce((sum, componentSize) => sum.plus(componentSize), ZERO)
  const autoChildren = children.filter((child) => isMainAxisAuto(child, parent))
  const availableAutoSpace = BigNumber.maximum(parentSpace.minus(gapSpace).minus(fixedComponentSpace), ZERO)
  const autoComponentSize =
    autoChildren.length === 0 ? ZERO : availableAutoSpace.dividedBy(new BigNumber(autoChildren.length))
  let remainingAutoSpace = availableAutoSpace

  for (const [index, child] of autoChildren.entries()) {
    const size = index === autoChildren.length - 1 ? remainingAutoSpace : autoComponentSize

    sizesById[child.id] = size
    remainingAutoSpace = remainingAutoSpace.minus(size)
  }

  return sizesById
}

const calculateCrossAxisSize = (
  child: PanelSchema | PocketClusterSchema,
  parentBoundingBox: RectSchema,
  parent: RootPanelSchema | PanelSchema,
): BigNumber => {
  const parentSpace = parent.layoutOrientation === 'horizontal' ? parentBoundingBox.height : parentBoundingBox.width

  if (isCrossAxisAuto(child, parent)) {
    return parentSpace
  }

  return clamp(getCrossAxisSize(child, parent), ZERO, parentSpace)
}

const calculateHorizontalCrossAxisPosition = (
  parentBoundingBox: RectSchema,
  child: PanelSchema | PocketClusterSchema,
  childHeight: BigNumber,
): BigNumber => {
  switch (child.offAxisAnchor) {
    case 'start':
      return parentBoundingBox.y
    case 'middle':
      return parentBoundingBox.y.plus(parentBoundingBox.height.minus(childHeight).dividedBy(2))
    case 'end':
      return parentBoundingBox.y.plus(parentBoundingBox.height.minus(childHeight))
  }
}

const calculateVerticalCrossAxisPosition = (
  parentBoundingBox: RectSchema,
  child: PanelSchema | PocketClusterSchema,
  childWidth: BigNumber,
): BigNumber => {
  switch (child.offAxisAnchor) {
    case 'start':
      return parentBoundingBox.x
    case 'middle':
      return parentBoundingBox.x.plus(parentBoundingBox.width.minus(childWidth).dividedBy(2))
    case 'end':
      return parentBoundingBox.x.plus(parentBoundingBox.width.minus(childWidth))
  }
}

const applySqueezeToBoundingBox = (
  component: PanelSchema | PocketClusterSchema,
  boundingBox: RectSchema,
  parentBoundingBox: RectSchema,
): RectSchema => {
  const maximumHorizontalSqueeze = BigNumber.maximum(boundingBox.width.dividedBy(2).minus(0.5), ZERO)
  const maximumVerticalSqueeze = BigNumber.maximum(boundingBox.height.dividedBy(2).minus(0.5), ZERO)
  const leftSqueeze = clamp(
    component.leftSqueeze,
    BigNumber.minimum(parentBoundingBox.x.minus(boundingBox.x), ZERO),
    maximumHorizontalSqueeze,
  )
  const rightSqueeze = clamp(
    component.rightSqueeze,
    BigNumber.minimum(
      boundingBox.x.plus(boundingBox.width).minus(parentBoundingBox.x.plus(parentBoundingBox.width)),
      ZERO,
    ),
    maximumHorizontalSqueeze,
  )
  const topSqueeze = clamp(
    component.topSqueeze,
    BigNumber.minimum(parentBoundingBox.y.minus(boundingBox.y), ZERO),
    maximumVerticalSqueeze,
  )
  const bottomSqueeze = clamp(
    component.bottomSqueeze,
    BigNumber.minimum(
      boundingBox.y.plus(boundingBox.height).minus(parentBoundingBox.y.plus(parentBoundingBox.height)),
      ZERO,
    ),
    maximumVerticalSqueeze,
  )

  return {
    x: boundingBox.x.plus(leftSqueeze),
    y: boundingBox.y.plus(topSqueeze),
    width: boundingBox.width.minus(leftSqueeze).minus(rightSqueeze),
    height: boundingBox.height.minus(topSqueeze).minus(bottomSqueeze),
  }
}

const isMainAxisAuto = (child: PanelSchema | PocketClusterSchema, parent: RootPanelSchema | PanelSchema): boolean => {
  return parent.layoutOrientation === 'horizontal' ? child.autoWidth : child.autoHeight
}

const getMainAxisSize = (child: PanelSchema | PocketClusterSchema, parent: RootPanelSchema | PanelSchema): number => {
  return parent.layoutOrientation === 'horizontal' ? child.width : child.height
}

const isCrossAxisAuto = (child: PanelSchema | PocketClusterSchema, parent: RootPanelSchema | PanelSchema): boolean => {
  return parent.layoutOrientation === 'horizontal' ? child.autoHeight : child.autoWidth
}

const getCrossAxisSize = (child: PanelSchema | PocketClusterSchema, parent: RootPanelSchema | PanelSchema): number => {
  return parent.layoutOrientation === 'horizontal' ? child.height : child.width
}
