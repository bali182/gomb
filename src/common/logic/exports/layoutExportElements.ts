import BigNumber from 'bignumber.js'
import type { ExportPageElementSchema } from '../../schemas/export'
import type { RectSchema } from '../../schemas/geometry'
import { createExportPlacement, createExportRect } from './exportGeometryUtils'
import type { ExportLayoutElement } from './helperTypes'

export const layoutExportElementsVertically = (
  elements: readonly ExportLayoutElement[],
  usableRect: RectSchema,
  gap: number,
): ExportPageElementSchema[][] => {
  const pages: ExportPageElementSchema[][] = []
  const gapValue = new BigNumber(gap)
  let page: ExportPageElementSchema[] = []
  let nextY = usableRect.y

  elements.forEach(({ element, boundingRect: sourceRect, isOversized }) => {
    if (page.length > 0 && nextY.plus(sourceRect.height).isGreaterThan(usableRect.y.plus(usableRect.height))) {
      pages.push(page)
      page = []
      nextY = usableRect.y
    }

    page.push({
      element,
      isOversized,
      placement: createExportPlacement(
        sourceRect,
        createExportRect(usableRect.x, nextY, sourceRect.width, sourceRect.height),
        0,
      ),
    })
    nextY = nextY.plus(sourceRect.height).plus(gapValue)
  })

  if (page.length > 0) {
    pages.push(page)
  }

  return pages
}

export const layoutExportElementsHorizontally = (
  elements: readonly ExportLayoutElement[],
  usableRect: RectSchema,
  gap: number,
): ExportPageElementSchema[][] => {
  const pages: ExportPageElementSchema[][] = []
  const gapValue = new BigNumber(gap)
  let page: ExportPageElementSchema[] = []
  let nextX = usableRect.x

  elements.forEach(({ element, boundingRect: sourceRect, isOversized }) => {
    if (page.length > 0 && nextX.plus(sourceRect.width).isGreaterThan(usableRect.x.plus(usableRect.width))) {
      pages.push(page)
      page = []
      nextX = usableRect.x
    }

    page.push({
      element,
      isOversized,
      placement: createExportPlacement(
        sourceRect,
        createExportRect(nextX, usableRect.y, sourceRect.width, sourceRect.height),
        0,
      ),
    })
    nextX = nextX.plus(sourceRect.width).plus(gapValue)
  })

  if (page.length > 0) {
    pages.push(page)
  }

  return pages
}
