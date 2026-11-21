import BigNumber from 'bignumber.js'
import { ZERO } from '../constants/layout'
import type {
  FrontPocketSchema,
  GuideSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelFaceSchema,
} from '../schemas/components'
import { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

export const calculateGap = (
  children: (PanelSchema | PocketClusterSchema)[],
  parentBoundingBox: RectSchema,
  parent: RootPanelFaceSchema | PanelSchema | FrontPocketSchema | GuideSchema,
): BigNumber => {
  if (!parent.autoLayoutGap) {
    return new BigNumber(parent.layoutGap)
  }

  const parentSpace = parent.layoutOrientation === 'horizontal' ? parentBoundingBox.width : parentBoundingBox.height
  const fixedComponentSpace = children.reduce((sum, child) => {
    if (isMainAxisAuto(child, parent)) {
      return sum
    }

    return sum.plus(clamp(getMainAxisSize(child, parent), ZERO))
  }, ZERO)
  const autoSizeCount = new BigNumber(children.filter((child) => isMainAxisAuto(child, parent)).length).plus(
    BigNumber.maximum(new BigNumber(children.length).minus(1), ZERO),
  )

  return autoSizeCount.isZero()
    ? ZERO
    : BigNumber.maximum(parentSpace.minus(fixedComponentSpace), ZERO).dividedBy(autoSizeCount)
}

const isMainAxisAuto = (
  child: PanelSchema | PocketClusterSchema,
  parent: RootPanelFaceSchema | PanelSchema | FrontPocketSchema | GuideSchema,
): boolean => {
  return parent.layoutOrientation === 'horizontal' ? child.autoWidth : child.autoHeight
}

const getMainAxisSize = (
  child: PanelSchema | PocketClusterSchema,
  parent: RootPanelFaceSchema | PanelSchema | FrontPocketSchema | GuideSchema,
): number => {
  return parent.layoutOrientation === 'horizontal' ? child.width : child.height
}
