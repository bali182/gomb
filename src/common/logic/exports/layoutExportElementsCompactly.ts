import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { ExportPageElementSchema, ExportPlacementRotation } from '../../schemas/export'
import type { RectSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { createExportPlacement, createExportRect } from './exportGeometryUtils'
import type { ExportLayoutElement } from './helperTypes'

type CompactPlacementCandidate = {
  pageIndex: number
  rotation: ExportPlacementRotation
  overflowArea: BigNumber
  scoreLongSide: BigNumber
  scoreShortSide: BigNumber
  boundingRect: RectSchema
}

type CompactPage = {
  freeRects: RectSchema[]
  page: ExportPageElementSchema[]
}

export const layoutExportElementsCompactly = (
  elements: readonly ExportLayoutElement[],
  usableRect: RectSchema,
  gap: number,
): ExportPageElementSchema[][] => {
  const gapValue = new BigNumber(gap)
  const compactPages: CompactPage[] = []
  const elementsByArea = [...elements].sort((left, right) => {
    const priority = Number(right.isOversized) - Number(left.isOversized)
    if (priority !== 0) {
      return priority
    }
    return compareBigNumbers(
      right.boundingRect.width.times(right.boundingRect.height),
      left.boundingRect.width.times(left.boundingRect.height),
    )
  })

  for (const input of elementsByArea) {
    let placement = findCompactPlacement(compactPages, input, usableRect, gapValue)
    if (!isDefined(placement)) {
      compactPages.push({
        freeRects: [
          createExportRect(
            usableRect.x,
            usableRect.y,
            usableRect.width.plus(gapValue),
            usableRect.height.plus(gapValue),
          ),
        ],
        page: [],
      })
      placement = findCompactPlacement(compactPages, input, usableRect, gapValue)
    }
    if (!isDefined(placement)) {
      throw new Error(`Unable to place export element: ${input.element.id}`)
    }
    const compactPage = compactPages[placement.pageIndex]
    compactPage.page.push({
      element: input.element,
      isOversized: input.isOversized,
      placement: createExportPlacement(input.boundingRect, placement.boundingRect, placement.rotation),
    })
    compactPage.freeRects = splitFreeRects(compactPage.freeRects, getFootprint(placement.boundingRect, gapValue))
  }
  return compactPages.map((page) => page.page)
}

const findCompactPlacement = (
  pages: readonly CompactPage[],
  input: ExportLayoutElement,
  usableRect: RectSchema,
  gap: BigNumber,
): CompactPlacementCandidate | undefined => {
  const unrotated = findCompactPlacementForRotation(pages, input, usableRect, gap, 0)
  if (!input.isOversized && isDefined(unrotated)) {
    return unrotated
  }
  const rotated = findCompactPlacementForRotation(pages, input, usableRect, gap, 90)
  if (!isDefined(unrotated)) {
    return rotated
  }
  if (!isDefined(rotated)) {
    return unrotated
  }
  return compareCompactPlacementCandidates(unrotated, rotated) <= 0 ? unrotated : rotated
}

const findCompactPlacementForRotation = (
  pages: readonly CompactPage[],
  input: ExportLayoutElement,
  usableRect: RectSchema,
  gap: BigNumber,
  rotation: ExportPlacementRotation,
): CompactPlacementCandidate | undefined => {
  let best: CompactPlacementCandidate | undefined
  const width = rotation === 0 ? input.boundingRect.width : input.boundingRect.height
  const height = rotation === 0 ? input.boundingRect.height : input.boundingRect.width
  for (const [pageIndex, page] of pages.entries()) {
    for (const freeRect of page.freeRects) {
      const boundingRect = createExportRect(freeRect.x, freeRect.y, width, height)
      const footprint = getFootprint(boundingRect, gap)
      if (!canPlaceCompactElement(boundingRect, footprint, freeRect, page, usableRect, gap, input.isOversized)) {
        continue
      }
      const horizontalRemainder = BigNumber.maximum(ZERO, freeRect.width.minus(footprint.width))
      const verticalRemainder = BigNumber.maximum(ZERO, freeRect.height.minus(footprint.height))
      const visibleWidth = BigNumber.minimum(width, usableRect.x.plus(usableRect.width).minus(boundingRect.x))
      const visibleHeight = BigNumber.minimum(height, usableRect.y.plus(usableRect.height).minus(boundingRect.y))
      const candidate: CompactPlacementCandidate = {
        pageIndex,
        rotation,
        boundingRect,
        overflowArea: width.times(height).minus(visibleWidth.times(visibleHeight)),
        scoreShortSide: BigNumber.minimum(horizontalRemainder, verticalRemainder),
        scoreLongSide: BigNumber.maximum(horizontalRemainder, verticalRemainder),
      }
      if (!isDefined(best) || compareCompactPlacementCandidates(candidate, best) < 0) {
        best = candidate
      }
    }
  }
  return best
}

const canPlaceCompactElement = (
  boundingRect: RectSchema,
  footprint: RectSchema,
  freeRect: RectSchema,
  page: CompactPage,
  usableRect: RectSchema,
  gap: BigNumber,
  isOversized: boolean,
): boolean => {
  if (!isOversized) {
    return (
      footprint.width.isLessThanOrEqualTo(freeRect.width) &&
      footprint.height.isLessThanOrEqualTo(freeRect.height) &&
      isWithinUsableRect(boundingRect, usableRect)
    )
  }
  const right = usableRect.x.plus(usableRect.width)
  const bottom = usableRect.y.plus(usableRect.height)
  if (boundingRect.x.isGreaterThanOrEqualTo(right) || boundingRect.y.isGreaterThanOrEqualTo(bottom)) {
    return false
  }
  // Only the footprint outside the usable page may extend beyond its free rectangle.
  const inside = createExportRect(
    footprint.x,
    footprint.y,
    BigNumber.minimum(footprint.width, right.plus(gap).minus(footprint.x)),
    BigNumber.minimum(footprint.height, bottom.plus(gap).minus(footprint.y)),
  )
  return (
    containsRect(freeRect, inside) &&
    !page.page.some(({ placement }) => rectsIntersect(footprint, getFootprint(placement.placementBoundingRect, gap)))
  )
}

const compareCompactPlacementCandidates = (
  left: CompactPlacementCandidate,
  right: CompactPlacementCandidate,
): number => {
  const overflowComparison = compareBigNumbers(left.overflowArea, right.overflowArea)
  if (overflowComparison !== 0) {
    return overflowComparison
  }
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
  return createExportRect(boundingRect.x, boundingRect.y, boundingRect.width.plus(gap), boundingRect.height.plus(gap))
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
    splitRects.push(createExportRect(freeRect.x, freeRect.y, footprint.x.minus(freeRect.x), freeRect.height))
  }

  if (footprintRight.isLessThan(freeRight)) {
    splitRects.push(createExportRect(footprintRight, freeRect.y, freeRight.minus(footprintRight), freeRect.height))
  }

  if (footprint.y.isGreaterThan(freeRect.y)) {
    splitRects.push(createExportRect(freeRect.x, freeRect.y, freeRect.width, footprint.y.minus(freeRect.y)))
  }

  if (footprintBottom.isLessThan(freeBottom)) {
    splitRects.push(createExportRect(freeRect.x, footprintBottom, freeRect.width, freeBottom.minus(footprintBottom)))
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

const compareBigNumbers = (left: BigNumber, right: BigNumber): number => {
  return left.comparedTo(right) ?? 0
}
