import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import { PNG_EXTENSION } from '../../constants/fileExtensions'
import {
  MILLIMETERS_PER_INCH,
  PNG_DPI,
  PNG_SHADOW_BLUR,
  PNG_SHADOW_OFFSET_Y,
  PNG_SHADOW_PADDING,
  PNG_SHADOW_SPREAD,
} from '../../constants/pngExport'
import type { ComputedComponentSchema, ComputedStitchRouteSchema } from '../../schemas/computed'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { RectSchema } from '../../schemas/geometry'
import type { ProjectSchema } from '../../schemas/project'
import type { GlobalSettingsSchema } from '../../schemas/settings'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import type { TranslationSchema } from '../../translations/translationSchema'
import { accessors } from '../../utils/accessors'
import { downloadBlob } from '../../utils/downloadBlob'
import { isDefined } from '../../utils/isDefined'
import { reflectRectHorizontally } from '../geometryUtils'
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
  const accessor = accessors.subProject(subProject)
  const component = accessor.component.byId(componentId)
  const exportComponent = narrowers.is.rootPanelFace(component)
    ? accessor.component.rootPanel(accessor.component.parent(component.id).id)
    : component
  const exportContext: DrawAreaContextValue = narrowers.is.rootPanelFace(component)
    ? { ...context, rootPanelFaceId: component.id }
    : context
  const computedSubProject = getComputedSubProject(subProject, project.stitchingSettings)
  const computedAccessor = accessors.computedSubProject(computedSubProject)
  const computedRoot = computedAccessor.component.rootPanel()
  const computedComponent = computedAccessor.component.byId(exportComponent.id)

  const nestingLevel = findNestingLevel(computedRoot, exportComponent.id, computedSubProject)
  if (!isDefined(nestingLevel)) {
    throw new Error(`Component not found in tree: ${exportComponent.id}`)
  }

  const rects = collectBoundingRects(computedComponent, computedSubProject, {
    ...params,
    componentId: exportComponent.id,
    context: exportContext,
  })
  if (rects.length === 0) {
    return
  }
  const boundingRect = addShadowPadding(getBoundingRectUnion(rects))

  const svg = renderSvgComponentToString({
    editorValues: { project, subProject, computedSubProject },
    settings,
    context: exportContext,
    componentId: exportComponent.id,
    nestingLevel,
    boundingRect,
  })
  const image = await renderSvgToPng({ svg, size: boundingRect })
  downloadBlob(new Blob([new Uint8Array(image)], { type: 'image/png' }), `${component.name}.${PNG_EXTENSION}`)
}

const findNestingLevel = (
  component: ComputedComponentSchema,
  componentId: string,
  computedSubProject: ComputedSubProjectSchema,
  level: number = 0,
): number | undefined => {
  if (component.componentId === componentId) {
    return level
  }
  const accessor = accessors.computedSubProject(computedSubProject)
  for (const child of accessor.component.children(component.componentId)) {
    const childLevel = findNestingLevel(
      child,
      componentId,
      computedSubProject,
      narrowers.is.computedGuide(component) ||
        narrowers.is.computedPocketCluster(component) ||
        narrowers.is.computedRootPanel(component)
        ? level
        : level + 1,
    )
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
  computedSubProject: ComputedSubProjectSchema,
  params: ExportComponentPngParams,
): RectSchema[] => {
  if (narrowers.is.computedGuide(component)) {
    return []
  }
  const { subProject, context } = params
  const model = accessors.subProject(subProject).component.byId(component.componentId)
  const styleParams = { component: model }
  const borderPadding = (context.componentStyles.getBorderThickness(styleParams) ?? 0) / 2
  const boundingRects = [padBoundingRect(component.boundingRect, borderPadding)]

  if (narrowers.is.computedPocketCluster(component) && narrowers.is.pocketCluster(model)) {
    const computedAccessor = accessors.computedSubProject(computedSubProject)
    for (const pocket of computedAccessor.component.children(component.componentId)) {
      boundingRects.push(padBoundingRect(pocket.boundingRect, borderPadding))
      if (
        context.isShowingPocketItems &&
        (narrowers.is.computedFrontPocket(pocket) || narrowers.is.computedTPocket(pocket)) &&
        isDefined(pocket.item)
      ) {
        const owner = accessors.subProject(subProject).component.pocket(pocket.componentId)
        boundingRects.push(
          padBoundingRect(pocket.item.boundingRect, (context.pocketItemStyles.getStrokeThickness({ owner }) ?? 0) / 2),
        )
      }
    }
  }
  if (
    (narrowers.is.computedFrontPocket(component) || narrowers.is.computedTPocket(component)) &&
    !narrowers.is.pocketCluster(model) &&
    !narrowers.is.guide(model) &&
    !narrowers.is.panel(model) &&
    !narrowers.is.rootPanel(model) &&
    !narrowers.is.rootPanelFace(model) &&
    context.isShowingPocketItems &&
    isDefined(component.item)
  ) {
    boundingRects.push(
      padBoundingRect(
        component.item.boundingRect,
        (context.pocketItemStyles.getStrokeThickness({ owner: model }) ?? 0) / 2,
      ),
    )
  }
  return boundingRects
}

const getStitchLineBoundingRects = (
  routes: readonly ComputedStitchRouteSchema[],
  faceId: string,
  axisX: BigNumber,
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
  for (const route of routes) {
    const stitchLine = accessor.optional.stitchLine.byId(route.stitchLineId)
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
    const rect = route.faceId === faceId ? route.boundingRect : reflectRectHorizontally(route.boundingRect, axisX)
    boundingRects.push(padBoundingRect(rect, padding))
  }
  return boundingRects
}

const collectBoundingRects = (
  component: ComputedComponentSchema,
  computedSubProject: ComputedSubProjectSchema,
  params: ExportComponentPngParams,
  isReversed = false,
): RectSchema[] => {
  const accessor = accessors.computedSubProject(computedSubProject)
  const root = accessor.component.rootPanel()
  const axisX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
  const componentFace = accessors
    .subProject(params.subProject)
    .optional.component.rootPanelFaceOf(component.componentId)
  const faceId = componentFace?.id ?? root.frontFaceId
  const routes = [
    ...accessor.stitchLine.byEntry(component.componentId),
    ...accessor.stitchLine.byExit(component.componentId),
  ]
  const ownRects = [
    ...getComponentBoundingRects(component, computedSubProject, params),
    ...getStitchLineBoundingRects(routes, faceId, axisX, params),
  ]
  const visibleRects = isReversed ? ownRects.map((rect) => reflectRectHorizontally(rect, axisX)) : ownRects
  const activeFaceId = params.context.rootPanelFaceId === root.backFaceId ? root.backFaceId : root.frontFaceId
  const childrenRects = accessor.component
    .children(component.componentId)
    .flatMap((child) =>
      collectBoundingRects(
        child,
        computedSubProject,
        params,
        narrowers.is.computedRootPanel(component) ? child.componentId !== activeFaceId : isReversed,
      ),
    )
  return [...visibleRects, ...childrenRects]
}

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
