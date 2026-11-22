import BigNumber from 'bignumber.js'
import { EXPORT_PAGE_GAP, ZERO } from '../../constants/layout'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type {
  ExportElementSchema,
  ExportLayoutSchema,
  ExportPageElementSchema,
  ExportPageSchema,
} from '../../schemas/export'
import type { PointSchema, RectSchema, SizeSchema } from '../../schemas/geometry'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { translateRect } from '../translateRect'
import {
  createExportRect,
  getExportElementLayoutBoundingRect,
  hasPerPageCoordinateSystem,
  translateExportElement,
} from './exportGeometryUtils'
import { getExportPageSize } from './getExportPageSize'
import type { ExportLayoutElement } from './helperTypes'
import { layoutExportElementsStacked } from './layoutExportElementsStacked'
import { layoutExportElementsCompactly } from './layoutExportElementsCompactly'

export const getExportLayout = (
  elements: ExportElementSchema[],
  settings: ExportSettingsSchema,
  context: DrawAreaContextValue,
): ExportLayoutSchema => {
  const pageSize = getExportPageSize(settings.page, settings.orientation)
  const usableRect = getUsableRect(pageSize, settings.padding)
  const inputs = elements.map((element): ExportLayoutElement => {
    const boundingRect = getExportElementStrokeBoundingRect(element, context)
    const fits =
      canFit(boundingRect.width, boundingRect.height, usableRect) ||
      (settings.layout === 'compact' && canFit(boundingRect.height, boundingRect.width, usableRect))
    return { element, boundingRect, isOversized: !fits }
  })
  if (settings.layout !== 'compact') {
    inputs.sort((left, right) => Number(right.isOversized) - Number(left.isOversized))
  }
  const pageElements = layoutElements(inputs, usableRect, settings.gap, settings.layout)
  const perPage = hasPerPageCoordinateSystem(settings.format)
  const pages = pageElements.map((elements, pageIndex): ExportPageSchema => {
    const pageTranslation: PointSchema = {
      x: ZERO,
      y: perPage ? ZERO : pageSize.height.plus(EXPORT_PAGE_GAP).times(pageIndex),
    }
    return {
      boundingRect: createExportRect(pageTranslation.x, pageTranslation.y, pageSize.width, pageSize.height),
      elements: elements.map(({ element, placement, isOversized }): ExportPageElementSchema => {
        const translation: PointSchema = {
          x: placement.x.minus(placement.boundingRect.x).plus(pageTranslation.x),
          y: placement.y.minus(placement.boundingRect.y).plus(pageTranslation.y),
        }
        return {
          element: translateExportElement(element, translation),
          isOversized,
          placement: {
            ...placement,
            boundingRect: translateRect(placement.boundingRect, translation),
            placementBoundingRect: translateRect(placement.placementBoundingRect, pageTranslation),
            x: placement.x.plus(pageTranslation.x),
            y: placement.y.plus(pageTranslation.y),
          },
        }
      }),
    }
  })
  return { pages }
}

const getUsableRect = (pageSize: SizeSchema, padding: number): RectSchema => {
  const inset = new BigNumber(padding)
  return createExportRect(inset, inset, pageSize.width.minus(inset.times(2)), pageSize.height.minus(inset.times(2)))
}

const canFit = (width: BigNumber, height: BigNumber, usableRect: RectSchema): boolean =>
  width.isLessThanOrEqualTo(usableRect.width) && height.isLessThanOrEqualTo(usableRect.height)

const getExportElementStrokeBoundingRect = (
  element: ExportElementSchema,
  context: DrawAreaContextValue,
): RectSchema => {
  const thickness = context.componentStyles.getBorderThickness({ component: element.component, nestingLevel: 0 }) ?? 0
  const padding = new BigNumber(thickness).dividedBy(2)
  const rect = getExportElementLayoutBoundingRect(element)
  return createExportRect(
    rect.x.minus(padding),
    rect.y.minus(padding),
    rect.width.plus(thickness),
    rect.height.plus(thickness),
  )
}

const layoutElements = (
  elements: readonly ExportLayoutElement[],
  usableRect: RectSchema,
  gap: number,
  layout: ExportSettingsSchema['layout'],
): ExportPageElementSchema[][] => {
  switch (layout) {
    case 'stacked':
      return layoutExportElementsStacked(elements, usableRect, gap)
    case 'compact':
      return layoutExportElementsCompactly(elements, usableRect, gap)
  }
}
