import BigNumber from 'bignumber.js'

import { EXPORT_PAGE_GAP, ZERO } from '../../constants/layout'
import { pages } from '../../data/pages'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type {
  ExportElementSchema,
  ExportLayoutSchema,
  ExportPageElementSchema,
  ExportPageSchema,
  ExportPanelSchema,
  ExportPlacementRotation,
  ExportPlacementSchema,
} from '../../schemas/export'
import type { PointSchema, RectSchema, SizeSchema } from '../../schemas/geometry'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { isDefined } from '../../utils/isDefined'
import { translateRect } from '../translateRect'
import {
  getExportElementLayoutBoundingRect,
  hasPerPageCoordinateSystem,
  translateExportElement,
} from './exportGeometryUtils'

type CompactPlacementCandidate = {
  pageIndex: number
  freeRectIndex: number
  rotation: 0 | 90
  scoreLongSide: BigNumber
  scoreShortSide: BigNumber
  boundingRect: RectSchema
}

type CompactPage = {
  freeRects: RectSchema[]
  page: ExportPageElementSchema[]
}

export const getExportPageSize = (settings: ExportSettingsSchema): SizeSchema => {
  const page = pages.find((candidate) => candidate.id === settings.page)

  if (!isDefined(page)) {
    throw new Error(`Page not found: ${settings.page}`)
  }

  return settings.orientation === 'portrait'
    ? { width: new BigNumber(page.width), height: new BigNumber(page.height) }
    : { width: new BigNumber(page.height), height: new BigNumber(page.width) }
}

export const getExportLayout = (
  elements: ExportElementSchema[],
  settings: ExportSettingsSchema,
  context: DrawAreaContextValue,
): ExportLayoutSchema => {
  const pageSize = getExportPageSize(settings)
  const usableRect = getUsableRect(pageSize, settings.padding)
  const unplaceableElements = getUnplaceableElements(elements, usableRect, settings.layout, context)

  if (unplaceableElements.length > 0) {
    const unplaceables = unplaceableElements.filter(
      (element): element is ExportPanelSchema => element.type === 'export-panel',
    )

    if (unplaceables.length === 0) {
      throw new Error('Expected an unplaceable panel')
    }

    return { type: 'unsuccessful-export', unplaceables }
  }

  const pageElements = layoutElements(elements, usableRect, settings.gap, settings.layout, context)
  const perPageCoordinateSystem = hasPerPageCoordinateSystem(settings.format)
  const pages = pageElements.map((elements, pageIndex): ExportPageSchema => {
    const pageTranslation: PointSchema = {
      x: ZERO,
      y: perPageCoordinateSystem ? ZERO : pageSize.height.plus(EXPORT_PAGE_GAP).times(pageIndex),
    }

    return {
      boundingRect: createRect(pageTranslation.x, pageTranslation.y, pageSize.width, pageSize.height),
      elements: elements.map(({ element, placement }): ExportPageElementSchema => {
        const translation: PointSchema = {
          x: placement.x.minus(placement.boundingRect.x).plus(pageTranslation.x),
          y: placement.y.minus(placement.boundingRect.y).plus(pageTranslation.y),
        }

        return {
          element: translateExportElement(element, translation),
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

  return { type: 'successful-export', pages }
}

const getUsableRect = (pageSize: SizeSchema, padding: number): RectSchema => {
  const paddingValue = new BigNumber(padding)

  return {
    x: paddingValue,
    y: paddingValue,
    width: pageSize.width.minus(paddingValue.times(2)),
    height: pageSize.height.minus(paddingValue.times(2)),
  }
}

const getUnplaceableElements = (
  elements: ExportElementSchema[],
  usableRect: RectSchema,
  layout: ExportSettingsSchema['layout'],
  context: DrawAreaContextValue,
): ExportElementSchema[] => {
  return elements.filter((element) => {
    const boundingRect = getExportElementStrokeBoundingRect(element, context)

    if (layout === 'compact') {
      return (
        !canFit(boundingRect.width, boundingRect.height, usableRect) &&
        !canFit(boundingRect.height, boundingRect.width, usableRect)
      )
    }

    return !canFit(boundingRect.width, boundingRect.height, usableRect)
  })
}

const canFit = (width: BigNumber, height: BigNumber, usableRect: RectSchema): boolean => {
  return width.isLessThanOrEqualTo(usableRect.width) && height.isLessThanOrEqualTo(usableRect.height)
}

const getExportElementStrokeBoundingRect = (
  element: ExportElementSchema,
  context: DrawAreaContextValue,
): RectSchema => {
  const component = element.type === 'export-panel' ? element.component : element.ownerComponent
  const borderThickness = context.componentStyles.getBorderThickness({ component, nestingLevel: 0 }) ?? 0
  const padding = new BigNumber(borderThickness).dividedBy(2)
  const boundingRect = getExportElementLayoutBoundingRect(element)

  return createRect(
    boundingRect.x.minus(padding),
    boundingRect.y.minus(padding),
    boundingRect.width.plus(padding.times(2)),
    boundingRect.height.plus(padding.times(2)),
  )
}

const layoutElements = (
  elements: ExportElementSchema[],
  usableRect: RectSchema,
  gap: number,
  layout: ExportSettingsSchema['layout'],
  context: DrawAreaContextValue,
): ExportPageElementSchema[][] => {
  switch (layout) {
    case 'vertical':
      return layoutVertically(elements, usableRect, gap, context)
    case 'horizontal':
      return layoutHorizontally(elements, usableRect, gap, context)
    case 'compact':
      return layoutCompactly(elements, usableRect, gap, context)
  }
}

const layoutVertically = (
  elements: ExportElementSchema[],
  usableRect: RectSchema,
  gap: number,
  context: DrawAreaContextValue,
): ExportPageElementSchema[][] => {
  const pages: ExportPageElementSchema[][] = []
  const gapValue = new BigNumber(gap)
  let page: ExportPageElementSchema[] = []
  let nextY = usableRect.y

  elements.forEach((element) => {
    const sourceRect = getExportElementStrokeBoundingRect(element, context)

    if (nextY.plus(sourceRect.height).isGreaterThan(usableRect.y.plus(usableRect.height))) {
      pages.push(page)
      page = []
      nextY = usableRect.y
    }

    page.push({
      element,
      placement: createExportPlacement(
        sourceRect,
        createRect(usableRect.x, nextY, sourceRect.width, sourceRect.height),
        0,
      ),
    })
    nextY = nextY.plus(sourceRect.height).plus(gapValue)
  })

  pages.push(page)

  return pages
}

const layoutHorizontally = (
  elements: ExportElementSchema[],
  usableRect: RectSchema,
  gap: number,
  context: DrawAreaContextValue,
): ExportPageElementSchema[][] => {
  const pages: ExportPageElementSchema[][] = []
  const gapValue = new BigNumber(gap)
  let page: ExportPageElementSchema[] = []
  let nextX = usableRect.x

  elements.forEach((element) => {
    const sourceRect = getExportElementStrokeBoundingRect(element, context)

    if (nextX.plus(sourceRect.width).isGreaterThan(usableRect.x.plus(usableRect.width))) {
      pages.push(page)
      page = []
      nextX = usableRect.x
    }

    page.push({
      element,
      placement: createExportPlacement(
        sourceRect,
        createRect(nextX, usableRect.y, sourceRect.width, sourceRect.height),
        0,
      ),
    })
    nextX = nextX.plus(sourceRect.width).plus(gapValue)
  })

  pages.push(page)

  return pages
}

const layoutCompactly = (
  elements: ExportElementSchema[],
  usableRect: RectSchema,
  gap: number,
  context: DrawAreaContextValue,
): ExportPageElementSchema[][] => {
  const gapValue = new BigNumber(gap)
  const compactPages: CompactPage[] = []
  const elementsByArea = [...elements].sort((left, right) => {
    const leftRect = getExportElementStrokeBoundingRect(left, context)
    const rightRect = getExportElementStrokeBoundingRect(right, context)

    return compareBigNumbers(rightRect.width.times(rightRect.height), leftRect.width.times(leftRect.height))
  })

  elementsByArea.forEach((element) => {
    const sourceRect = getExportElementStrokeBoundingRect(element, context)
    let placement = findCompactPlacement(compactPages, sourceRect, usableRect, gapValue)

    if (!isDefined(placement)) {
      compactPages.push(createCompactPage(usableRect, gapValue))
      placement = findCompactPlacement(compactPages, sourceRect, usableRect, gapValue)
    }

    if (!isDefined(placement)) {
      throw new Error(`Unable to place export element: ${element.id}`)
    }

    const compactPage = compactPages[placement.pageIndex]

    if (!isDefined(compactPage)) {
      throw new Error(`Page not found: ${placement.pageIndex}`)
    }

    compactPage.page.push({
      element,
      placement: createExportPlacement(sourceRect, placement.boundingRect, placement.rotation),
    })
    compactPage.freeRects = splitFreeRects(compactPage.freeRects, getFootprint(placement.boundingRect, gapValue))
  })

  return compactPages.map((compactPage) => compactPage.page)
}

const createExportPlacement = (
  boundingRect: RectSchema,
  placementBoundingRect: RectSchema,
  rotation: ExportPlacementRotation,
): ExportPlacementSchema => {
  if (rotation === 0) {
    return {
      boundingRect,
      placementBoundingRect,
      rotation,
      x: placementBoundingRect.x,
      y: placementBoundingRect.y,
    }
  }

  return {
    boundingRect,
    placementBoundingRect,
    rotation,
    x: placementBoundingRect.x.plus(placementBoundingRect.width.dividedBy(2)).minus(boundingRect.width.dividedBy(2)),
    y: placementBoundingRect.y.plus(placementBoundingRect.height.dividedBy(2)).minus(boundingRect.height.dividedBy(2)),
  }
}

const createCompactPage = (usableRect: RectSchema, gap: BigNumber): CompactPage => ({
  freeRects: [createRect(usableRect.x, usableRect.y, usableRect.width.plus(gap), usableRect.height.plus(gap))],
  page: [],
})

const findCompactPlacement = (
  pages: CompactPage[],
  sourceRect: RectSchema,
  usableRect: RectSchema,
  gap: BigNumber,
): CompactPlacementCandidate | undefined => {
  const unrotatedCandidate = findCompactPlacementForRotation(pages, sourceRect, usableRect, gap, 0)

  if (isDefined(unrotatedCandidate)) {
    return unrotatedCandidate
  }

  return findCompactPlacementForRotation(pages, sourceRect, usableRect, gap, 90)
}

const findCompactPlacementForRotation = (
  pages: CompactPage[],
  sourceRect: RectSchema,
  usableRect: RectSchema,
  gap: BigNumber,
  rotation: ExportPlacementSchema['rotation'],
): CompactPlacementCandidate | undefined => {
  let bestCandidate: CompactPlacementCandidate | undefined

  pages.forEach((page, pageIndex) => {
    page.freeRects.forEach((freeRect, freeRectIndex) => {
      const width = rotation === 0 ? sourceRect.width : sourceRect.height
      const height = rotation === 0 ? sourceRect.height : sourceRect.width
      const footprintWidth = width.plus(gap)
      const footprintHeight = height.plus(gap)

      if (footprintWidth.isGreaterThan(freeRect.width) || footprintHeight.isGreaterThan(freeRect.height)) {
        return
      }

      const boundingRect = createRect(freeRect.x, freeRect.y, width, height)

      if (!isWithinUsableRect(boundingRect, usableRect)) {
        return
      }

      const horizontalRemainder = freeRect.width.minus(footprintWidth)
      const verticalRemainder = freeRect.height.minus(footprintHeight)
      const candidate: CompactPlacementCandidate = {
        pageIndex,
        freeRectIndex,
        rotation,
        scoreShortSide: BigNumber.minimum(horizontalRemainder, verticalRemainder),
        scoreLongSide: BigNumber.maximum(horizontalRemainder, verticalRemainder),
        boundingRect,
      }

      if (!isDefined(bestCandidate) || compareCompactPlacementCandidates(candidate, bestCandidate) < 0) {
        bestCandidate = candidate
      }
    })
  })

  return bestCandidate
}

const compareCompactPlacementCandidates = (
  left: CompactPlacementCandidate,
  right: CompactPlacementCandidate,
): number => {
  const shortSideComparison = compareBigNumbers(left.scoreShortSide, right.scoreShortSide)

  if (shortSideComparison !== 0) {
    return shortSideComparison
  }

  const longSideComparison = compareBigNumbers(left.scoreLongSide, right.scoreLongSide)

  if (longSideComparison !== 0) {
    return longSideComparison
  }

  if (left.pageIndex !== right.pageIndex) {
    return left.pageIndex - right.pageIndex
  }

  const yComparison = compareBigNumbers(left.boundingRect.y, right.boundingRect.y)

  if (yComparison !== 0) {
    return yComparison
  }

  const xComparison = compareBigNumbers(left.boundingRect.x, right.boundingRect.x)

  if (xComparison !== 0) {
    return xComparison
  }

  return left.rotation - right.rotation
}

const getFootprint = (boundingRect: RectSchema, gap: BigNumber): RectSchema => {
  return createRect(boundingRect.x, boundingRect.y, boundingRect.width.plus(gap), boundingRect.height.plus(gap))
}

const splitFreeRects = (freeRects: RectSchema[], footprint: RectSchema): RectSchema[] => {
  const nextFreeRects = freeRects.flatMap((freeRect) => splitFreeRect(freeRect, footprint))

  return nextFreeRects.filter((freeRect, index) => {
    return !nextFreeRects.some((candidate, candidateIndex) => {
      return candidateIndex !== index && containsRect(candidate, freeRect)
    })
  })
}

const splitFreeRect = (freeRect: RectSchema, footprint: RectSchema): RectSchema[] => {
  if (!rectsIntersect(freeRect, footprint)) {
    return [freeRect]
  }

  const freeRight = freeRect.x.plus(freeRect.width)
  const freeBottom = freeRect.y.plus(freeRect.height)
  const footprintRight = footprint.x.plus(footprint.width)
  const footprintBottom = footprint.y.plus(footprint.height)
  const splitRects: RectSchema[] = []

  if (footprint.x.isGreaterThan(freeRect.x)) {
    splitRects.push(createRect(freeRect.x, freeRect.y, footprint.x.minus(freeRect.x), freeRect.height))
  }

  if (footprintRight.isLessThan(freeRight)) {
    splitRects.push(createRect(footprintRight, freeRect.y, freeRight.minus(footprintRight), freeRect.height))
  }

  if (footprint.y.isGreaterThan(freeRect.y)) {
    splitRects.push(createRect(freeRect.x, freeRect.y, freeRect.width, footprint.y.minus(freeRect.y)))
  }

  if (footprintBottom.isLessThan(freeBottom)) {
    splitRects.push(createRect(freeRect.x, footprintBottom, freeRect.width, freeBottom.minus(footprintBottom)))
  }

  return splitRects.filter((rect) => rect.width.isGreaterThan(ZERO) && rect.height.isGreaterThan(ZERO))
}

const rectsIntersect = (left: RectSchema, right: RectSchema): boolean => {
  return (
    left.x.isLessThan(right.x.plus(right.width)) &&
    left.x.plus(left.width).isGreaterThan(right.x) &&
    left.y.isLessThan(right.y.plus(right.height)) &&
    left.y.plus(left.height).isGreaterThan(right.y)
  )
}

const containsRect = (container: RectSchema, content: RectSchema): boolean => {
  return (
    container.x.isLessThanOrEqualTo(content.x) &&
    container.y.isLessThanOrEqualTo(content.y) &&
    container.x.plus(container.width).isGreaterThanOrEqualTo(content.x.plus(content.width)) &&
    container.y.plus(container.height).isGreaterThanOrEqualTo(content.y.plus(content.height))
  )
}

const isWithinUsableRect = (boundingRect: RectSchema, usableRect: RectSchema): boolean => {
  return (
    boundingRect.x.isGreaterThanOrEqualTo(usableRect.x) &&
    boundingRect.y.isGreaterThanOrEqualTo(usableRect.y) &&
    boundingRect.x.plus(boundingRect.width).isLessThanOrEqualTo(usableRect.x.plus(usableRect.width)) &&
    boundingRect.y.plus(boundingRect.height).isLessThanOrEqualTo(usableRect.y.plus(usableRect.height))
  )
}

const createRect = (x: BigNumber, y: BigNumber, width: BigNumber, height: BigNumber): RectSchema => ({
  x,
  y,
  width,
  height,
})

const compareBigNumbers = (left: BigNumber, right: BigNumber): number => {
  return left.comparedTo(right) ?? 0
}
