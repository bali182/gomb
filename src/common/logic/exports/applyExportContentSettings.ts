import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { ExportElementSchema } from '../../schemas/export'
import type { ExportContentSettingsSchema } from '../../schemas/settings'
import { isDefined } from '../../utils/isDefined'
import { calculateRectPath } from '../calculateRectPath'
import { getExportCutHelperBoundingRect, getExportElementBoundingRect } from './exportGeometryUtils'

export const applyExportContentSettings = (
  elements: readonly ExportElementSchema[],
  settings: ExportContentSettingsSchema,
): ExportElementSchema[] =>
  elements.map((element): ExportElementSchema => {
    const cutHelperBoundingRect = getExportCutHelperBoundingRect(
      getExportElementBoundingRect(element),
      settings.cutHelperDistance,
    )
    const cutHelper = isDefined(cutHelperBoundingRect)
      ? calculateRectPath(cutHelperBoundingRect, ZERO_CORNER_RADIUS)
      : undefined
    if (element.type === 'export-panel') {
      return {
        ...element,
        cutHelper,
        cutHelperBoundingRect,
        childMarkerPaths: settings.childMarkers ? element.childMarkerPaths : [],
      }
    }
    return { ...element, cutHelper, cutHelperBoundingRect }
  })
