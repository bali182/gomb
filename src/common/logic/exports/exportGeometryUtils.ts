import type { ComputedStitchHoleSchema } from '../../schemas/computed'
import type {
  ExportElementSchema,
  ExportFormatSchema,
  ExportFrontPocketSchema,
  ExportPanelSchema,
  ExportStitchLineSchema,
  ExportTPocketSchema,
} from '../../schemas/export'
import type { PointSchema, RectSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { translatePath } from '../translatePath'
import { translateRect } from '../translateRect'

export const hasPerPageCoordinateSystem = (format: ExportFormatSchema): boolean => {
  switch (format) {
    case 'pdf':
    case 'png':
      return true
    case 'svg':
      return false
  }
}

export const getExportElementBoundingRect = (element: ExportElementSchema): RectSchema => {
  switch (element.type) {
    case 'export-panel':
      return element.boundingRect
    case 'export-front-pocket':
    case 'export-t-pocket':
      return element.pocket.boundingRect
  }
}

export const getExportElementLayoutBoundingRect = (element: ExportElementSchema): RectSchema => {
  if (isDefined(element.cutHelperBoundingRect)) {
    return element.cutHelperBoundingRect
  }

  return getExportElementBoundingRect(element)
}

export const getExportCutHelperBoundingRect = (
  boundingRect: RectSchema,
  cutHelperDistance: number,
): RectSchema | undefined => {
  if (cutHelperDistance === 0) {
    return undefined
  }

  return {
    x: boundingRect.x.minus(cutHelperDistance),
    y: boundingRect.y.minus(cutHelperDistance),
    width: boundingRect.width.plus(cutHelperDistance * 2),
    height: boundingRect.height.plus(cutHelperDistance * 2),
  }
}

export const translateExportElement = (element: ExportElementSchema, translation: PointSchema): ExportElementSchema => {
  switch (element.type) {
    case 'export-panel':
      return translateExportPanel(element, translation)
    case 'export-front-pocket':
      return translateExportFrontPocket(element, translation)
    case 'export-t-pocket':
      return translateExportTPocket(element, translation)
  }
}

const translateExportPanel = (element: ExportPanelSchema, translation: PointSchema): ExportPanelSchema => {
  return {
    ...element,
    boundingRect: translateRect(element.boundingRect, translation),
    ...(isDefined(element.cutHelper) ? { cutHelper: translatePath(element.cutHelper, translation) } : {}),
    ...(isDefined(element.cutHelperBoundingRect)
      ? { cutHelperBoundingRect: translateRect(element.cutHelperBoundingRect, translation) }
      : {}),
    path: translatePath(element.path, translation),
    childMarkerPaths: element.childMarkerPaths.map((path) => translatePath(path, translation)),
    stitchLines: element.stitchLines.map((stitchLine) => translateExportStitchLine(stitchLine, translation)),
  }
}

const translateExportFrontPocket = (
  element: ExportFrontPocketSchema,
  translation: PointSchema,
): ExportFrontPocketSchema => {
  return {
    ...element,
    pocket: {
      ...element.pocket,
      boundingRect: translateRect(element.pocket.boundingRect, translation),
      path: translatePath(element.pocket.path, translation),
    },
    ...(isDefined(element.cutHelper) ? { cutHelper: translatePath(element.cutHelper, translation) } : {}),
    ...(isDefined(element.cutHelperBoundingRect)
      ? { cutHelperBoundingRect: translateRect(element.cutHelperBoundingRect, translation) }
      : {}),
    stitchLines: element.stitchLines.map((stitchLine) => translateExportStitchLine(stitchLine, translation)),
  }
}

const translateExportTPocket = (element: ExportTPocketSchema, translation: PointSchema): ExportTPocketSchema => {
  return {
    ...element,
    pocket: {
      ...element.pocket,
      boundingRect: translateRect(element.pocket.boundingRect, translation),
      path: translatePath(element.pocket.path, translation),
    },
    ...(isDefined(element.cutHelper) ? { cutHelper: translatePath(element.cutHelper, translation) } : {}),
    ...(isDefined(element.cutHelperBoundingRect)
      ? { cutHelperBoundingRect: translateRect(element.cutHelperBoundingRect, translation) }
      : {}),
    stitchLines: element.stitchLines.map((stitchLine) => translateExportStitchLine(stitchLine, translation)),
  }
}

const translateExportStitchLine = (
  stitchLine: ExportStitchLineSchema,
  translation: PointSchema,
): ExportStitchLineSchema => {
  return {
    ...stitchLine,
    paths: stitchLine.paths.map((path) => translatePath(path, translation)),
    holes: stitchLine.holes.map((hole) => translateStitchHole(hole, translation)),
  }
}

const translateStitchHole = (hole: ComputedStitchHoleSchema, translation: PointSchema): ComputedStitchHoleSchema => {
  return {
    ...hole,
    center: {
      x: hole.center.x.plus(translation.x),
      y: hole.center.y.plus(translation.y),
    },
    line: {
      start: {
        x: hole.line.start.x.plus(translation.x),
        y: hole.line.start.y.plus(translation.y),
      },
      end: {
        x: hole.line.end.x.plus(translation.x),
        y: hole.line.end.y.plus(translation.y),
      },
    },
  }
}
