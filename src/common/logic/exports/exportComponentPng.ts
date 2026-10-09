import BigNumber from 'bignumber.js'

import { PNG_EXTENSION } from '../../constants/fileExtensions'
import {
  MILLIMETERS_PER_INCH,
  PNG_DPI,
  PNG_SHADOW_BLUR,
  PNG_SHADOW_OFFSET_Y,
  PNG_SHADOW_PADDING,
  PNG_SHADOW_SPREAD,
} from '../../constants/pngExport'
import type { ComputedComponentSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { RectSchema } from '../../schemas/geometry'
import type { ProjectSchema } from '../../schemas/project'
import type { GlobalSettingsSchema } from '../../schemas/settings'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import type { TranslationSchema } from '../../translations/translationSchema'
import { accessors } from '../../utils/accessors'
import { downloadBlob } from '../../utils/downloadBlob'
import { isDefined } from '../../utils/isDefined'
import { getComputedSubProject } from '../getComputedSubProject'
import { renderSvgComponentToString } from './renderSvgComponentToString'
import { renderSvgToPng } from './renderSvgToPng'

type ExportComponentPngParams = {
  project: ProjectSchema
  subProject: SubProjectSchema
  componentId: string
  settings: GlobalSettingsSchema
  context: DrawAreaContextValue
  translation: TranslationSchema
}

export const exportComponentPng = async (params: ExportComponentPngParams): Promise<void> => {
  const { project, subProject, componentId, settings, context } = params
  const component = accessors.subProject(subProject).component(componentId)
  const computedSubProject = getComputedSubProject(subProject, project.stitchingSettings)
  const computedAccessor = accessors.computedSubProject(computedSubProject)
  const computedRoot = computedAccessor.rootPanel()
  const computedComponent = computedAccessor.component(componentId)

  const nestingLevel = findNestingLevel(computedRoot, componentId)
  if (!isDefined(nestingLevel)) {
    throw new Error(`Component not found in tree: ${componentId}`)
  }

  const rects = collectBoundingRects(computedComponent, nestingLevel, computedSubProject, params)
  const boundingRect = addShadowPadding(getBoundingRectUnion(rects))

  const svg = renderSvgComponentToString({
    editorValues: { project, subProject, computedSubProject },
    settings,
    context,
    componentId,
    nestingLevel,
    boundingRect,
  })
  const image = await renderSvgToPng({ svg, size: boundingRect })
  downloadBlob(new Blob([new Uint8Array(image)], { type: 'image/png' }), `${component.name}.${PNG_EXTENSION}`)
}

const findNestingLevel = (
  component: ComputedComponentSchema,
  componentId: string,
  level: number = 0,
): number | undefined => {
  if (component.componentId === componentId) {
    return level
  }
  for (const child of component.children) {
    const childLevel = findNestingLevel(child, componentId, level + 1)
    if (isDefined(childLevel)) {
      return childLevel
    }
  }
  return undefined
}

const padBoundingRect = (rect: RectSchema, padding: number): RectSchema => ({
  x: rect.x.minus(padding),
  y: rect.y.minus(padding),
  width: rect.width.plus(padding * 2),
  height: rect.height.plus(padding * 2),
})

const getComponentBoundingRects = (
  component: ComputedComponentSchema,
  nestingLevel: number,
  params: ExportComponentPngParams,
): RectSchema[] => {
  const { subProject, context } = params
  const model = accessors.subProject(subProject).component(component.componentId)
  const styleParams = { component: model, nestingLevel }
  const borderPadding = (context.componentStyles.getBorderThickness(styleParams) ?? 0) / 2
  const boundingRects = [padBoundingRect(component.boundingRect, borderPadding)]

  if (component.type === 'computed-pocket-cluster' && model.type === 'pocket-cluster') {
    for (const pocket of [...component.tPockets, component.frontPocket]) {
      boundingRects.push(padBoundingRect(pocket.boundingRect, borderPadding))
      if (context.isShowingCards && isDefined(pocket.card)) {
        boundingRects.push(
          padBoundingRect(pocket.card.boundingRect, (context.cardStyles.getStrokeThickness({ owner: model }) ?? 0) / 2),
        )
      }
    }
  }
  return boundingRects
}

const getStitchLineBoundingRects = (
  stitchLines: readonly ComputedStitchLineSchema[],
  params: ExportComponentPngParams,
): RectSchema[] => {
  const { project, subProject, settings, context } = params
  const { view } = settings
  const { stitchLineStyles } = context
  if (
    !(view.stitchLinesVisible || view.stitchHolesVisible || view.stitchHoleFootprintVisible || view.stitchesVisible)
  ) {
    return []
  }

  const boundingRects: RectSchema[] = []
  const accessor = accessors.subProject(subProject)
  for (const computedStitchLine of stitchLines) {
    const stitchLine = accessor.optional.stitchLine(computedStitchLine.stitchLineId)
    if (!isDefined(stitchLine)) {
      continue
    }
    const lineThickness = stitchLineStyles.getLineThickness(stitchLine) ?? 0
    const footprintThickness = stitchLineStyles.getStitchHoleFootprintThickness(stitchLine) ?? 0
    const threadThickness = stitchLineStyles.getThreadThickness(stitchLine) ?? 0
    const holeLength = stitchLine.stitchHoleLength ?? project.stitchingSettings.stitchHoleLength
    const holeThickness = stitchLineStyles.getStitchHoleThickness(stitchLine) ?? 0

    const linePadding = view.stitchLinesVisible ? lineThickness / 2 : 0
    const footprintPadding = view.stitchHoleFootprintVisible ? footprintThickness / 2 : 0
    const threadPadding = view.stitchesVisible ? threadThickness / 2 : 0
    const holePadding = view.stitchHolesVisible ? (holeLength + holeThickness) / 2 : 0
    const padding = Math.max(linePadding, footprintPadding, threadPadding, holePadding)
    boundingRects.push(padBoundingRect(computedStitchLine.boundingRect, padding))
  }
  return boundingRects
}

const collectBoundingRects = (
  component: ComputedComponentSchema,
  nestingLevel: number,
  computedSubProject: ComputedSubProjectSchema,
  params: ExportComponentPngParams,
): RectSchema[] => [
  ...getComponentBoundingRects(component, nestingLevel, params),
  ...getStitchLineBoundingRects(computedSubProject.stitchLines[component.componentId] ?? [], params),
  ...component.children.flatMap((child) => collectBoundingRects(child, nestingLevel + 1, computedSubProject, params)),
]

const getBoundingRectUnion = (rects: readonly RectSchema[]): RectSchema => {
  const first = rects[0]
  if (!isDefined(first)) {
    throw new Error('Expected at least one bounding rect')
  }
  let minX = first.x
  let minY = first.y
  let maxX = first.x.plus(first.width)
  let maxY = first.y.plus(first.height)
  for (const rect of rects) {
    minX = BigNumber.minimum(minX, rect.x)
    minY = BigNumber.minimum(minY, rect.y)
    maxX = BigNumber.maximum(maxX, rect.x.plus(rect.width))
    maxY = BigNumber.maximum(maxY, rect.y.plus(rect.height))
  }
  return { x: minX, y: minY, width: maxX.minus(minX), height: maxY.minus(minY) }
}

const addShadowPadding = (rect: RectSchema): RectSchema => {
  const millimetersPerPixel = MILLIMETERS_PER_INCH / PNG_DPI
  const shadowExtent = PNG_SHADOW_BLUR * PNG_SHADOW_SPREAD
  const horizontalPadding = (shadowExtent + PNG_SHADOW_PADDING) * millimetersPerPixel
  const topPadding = (Math.max(0, shadowExtent - PNG_SHADOW_OFFSET_Y) + PNG_SHADOW_PADDING) * millimetersPerPixel
  const bottomPadding = (shadowExtent + PNG_SHADOW_OFFSET_Y + PNG_SHADOW_PADDING) * millimetersPerPixel
  return {
    x: rect.x.minus(horizontalPadding),
    y: rect.y.minus(topPadding),
    width: rect.width.plus(horizontalPadding * 2),
    height: rect.height.plus(topPadding + bottomPadding),
  }
}
