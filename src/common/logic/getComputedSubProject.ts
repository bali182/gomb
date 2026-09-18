import BigNumber from 'bignumber.js'

import { getComponentChildren } from '../operations/subProject/utils/getComponentChildren'
import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type {
  ComputedCardSchema,
  ComputedComponentSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedRootPanelSchema,
  ComputedStitchLineSchema,
  HasBoundingRectSchema,
  HasComputedCardSchema,
} from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { ResolvedStitchLineSchema, StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { getResolvedStitchLine } from '../utils/getResolvedStitchLine'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { applyHolePathsToComputedComponents } from './applyHolePathsToComputedComponents'
import { calculateGap } from './calculateGap'
import { calculateHoles } from './calculateHoles'
import { calculateLayoutBoundingBoxes } from './calculateLayoutBoundingBoxes'
import { calculatePocketClusterGeometry } from './calculatePocketClusterGeometry'
import { calculateRectPath } from './calculateRectPath'
import { getCornerRadius } from './cornerRadiusUtils'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'
import { normalizePocketCluster } from './normalizePocketCluster'
import { calculateStitchLines } from './stitching/calculateStitchLines'

export const getComputedSubProject = (
  subProject: SubProjectSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ComputedSubProjectSchema => {
  const rootComponent = subProject.components[subProject.root]

  if (!isDefined(rootComponent) || rootComponent.type !== 'root-panel') {
    throw new Error(`Root component not found: ${subProject.root}`)
  }

  const computedComponents: Record<string, ComputedComponentSchema> = {}
  const resolvedStitchLines = subProject.stitchLines.map((stitchLine) =>
    getResolvedStitchLine(stitchLine, stitchingSettings),
  )
  const rootBoundingRect: RectSchema = {
    x: new BigNumber(0),
    y: new BigNumber(0),
    width: new BigNumber(rootComponent.width),
    height: new BigNumber(rootComponent.height),
  }
  const root = computeRootPanel(rootComponent, rootBoundingRect, subProject, resolvedStitchLines, computedComponents)
  const holes = calculateHoles(subProject.holes, computedComponents)
  const stitchLines = calculateStitchLines(
    resolvedStitchLines,
    subProject.components,
    computedComponents,
    subProject.holes,
    holes,
  )
  applyHolePathsToComputedComponents(computedComponents, holes)

  return {
    id: subProject.id,
    root: root.componentId,
    components: computedComponents,
    holes,
    stitchLines,
    viewBox: getSubProjectViewBox(Object.values(computedComponents), stitchLines),
  }
}

const computeComponent = (
  component: ComponentSchema,
  boundingRect: RectSchema,
  layoutBoundingRect: RectSchema,
  parentBoundingRect: RectSchema | undefined,
  parentCornerRadius: CornerRadiusSchema | undefined,
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedComponentSchema => {
  if (component.type === 'root-panel' || !isDefined(parentBoundingRect) || !isDefined(parentCornerRadius)) {
    throw new Error('Unexpected parameters')
  }
  switch (component.type) {
    case 'panel':
      return computePanel(
        component,
        boundingRect,
        layoutBoundingRect,
        parentBoundingRect,
        parentCornerRadius,
        subProject,
        resolvedStitchLines,
        computedComponents,
      )
    case 'pocket-cluster':
      return computePocketCluster(
        component,
        boundingRect,
        layoutBoundingRect,
        parentBoundingRect,
        parentCornerRadius,
        subProject,
        resolvedStitchLines,
        computedComponents,
      )
  }
}

const computeRootPanel = (
  rootPanel: RootPanelSchema,
  boundingRect: RectSchema,
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedRootPanelSchema => {
  const cornerRadius = getAdjustedCornerRadius({ boundingRect, cornerRadius: getCornerRadius(rootPanel) })
  const path = calculateRectPath(boundingRect, cornerRadius)
  const layoutChildren = assertLayoutChildren(getComponentChildren(rootPanel, subProject))
  const computedLayoutGap = calculateGap(layoutChildren, boundingRect, rootPanel)
  const children = computeLayoutChildren(
    rootPanel,
    boundingRect,
    boundingRect,
    cornerRadius,
    computedLayoutGap,
    layoutChildren,
    subProject,
    resolvedStitchLines,
    computedComponents,
  )
  const computed: ComputedRootPanelSchema = {
    type: 'computed-root-panel',
    componentId: rootPanel.id,
    boundingRect,
    path,
    uncutPath: path,
    children,
    cornerRadius,
    computedLayoutGap,
  }

  computedComponents[rootPanel.id] = computed

  return computed
}

const computePanel = (
  panel: PanelSchema,
  boundingRect: RectSchema,
  layoutBoundingRect: RectSchema,
  parentBoundingRect: RectSchema,
  parentCornerRadius: CornerRadiusSchema,
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedPanelSchema => {
  const cornerRadius = getAdjustedCornerRadius({
    boundingRect,
    cornerRadius: getCornerRadius(panel),
    parentBoundingRect,
    parentCornerRadius,
  })
  const path = calculateRectPath(boundingRect, cornerRadius)
  const layoutChildren = assertLayoutChildren(getComponentChildren(panel, subProject))
  const computedLayoutGap = calculateGap(layoutChildren, boundingRect, panel)
  const children = computeLayoutChildren(
    panel,
    boundingRect,
    boundingRect,
    cornerRadius,
    computedLayoutGap,
    layoutChildren,
    subProject,
    resolvedStitchLines,
    computedComponents,
  )
  const computed: ComputedPanelSchema = {
    type: 'computed-panel',
    componentId: panel.id,
    boundingRect,
    layoutBoundingRect,
    path,
    uncutPath: path,
    children,
    cornerRadius,
    computedLayoutGap,
  }

  computedComponents[panel.id] = computed

  return computed
}

const computePocketCluster = (
  pocketCluster: PocketClusterSchema,
  boundingRect: RectSchema,
  layoutBoundingRect: RectSchema,
  parentBoundingRect: RectSchema,
  parentCornerRadius: CornerRadiusSchema,
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedPocketClusterSchema => {
  const cornerRadius = getAdjustedCornerRadius({
    boundingRect,
    cornerRadius: getCornerRadius(pocketCluster),
    parentBoundingRect,
    parentCornerRadius,
    radiusCap: getPocketClusterRadiusCap(pocketCluster),
  })
  const normalizedPocketCluster = normalizePocketCluster(pocketCluster, boundingRect)
  const geometry = calculatePocketClusterGeometry(
    normalizedPocketCluster,
    boundingRect,
    cornerRadius,
    resolvedStitchLines,
  )
  const layoutChildren = assertLayoutChildren(getComponentChildren(pocketCluster, subProject))
  const computedLayoutGap = calculateGap(layoutChildren, geometry.frontPocket.boundingRect, pocketCluster)
  const children = computeLayoutChildren(
    pocketCluster,
    geometry.frontPocket.boundingRect,
    boundingRect,
    cornerRadius,
    computedLayoutGap,
    layoutChildren,
    subProject,
    resolvedStitchLines,
    computedComponents,
  )
  const path = calculateRectPath(boundingRect, cornerRadius)
  const computed: ComputedPocketClusterSchema = {
    type: 'computed-pocket-cluster',
    componentId: pocketCluster.id,
    boundingRect,
    layoutBoundingRect,
    path,
    uncutPath: path,
    cornerRadius,
    children,
    computedLayoutGap,
    frontPocket: geometry.frontPocket,
    tPockets: geometry.tPockets,
  }

  computedComponents[pocketCluster.id] = computed

  return computed
}

const getPocketClusterRadiusCap = (pocketCluster: PocketClusterSchema): Partial<CornerRadiusSchema> => {
  const pocketStep = new BigNumber(pocketCluster.pocketStep)

  switch (pocketCluster.orientation) {
    case 'up':
      return { topLeft: pocketStep, topRight: pocketStep }
    case 'right':
      return { topRight: pocketStep, bottomRight: pocketStep }
    case 'down':
      return { bottomRight: pocketStep, bottomLeft: pocketStep }
    case 'left':
      return { bottomLeft: pocketStep, topLeft: pocketStep }
  }
}

const computeLayoutChildren = (
  component: ComponentSchema,
  layoutBoundingRect: RectSchema,
  parentBoundingRect: RectSchema,
  parentCornerRadius: CornerRadiusSchema,
  computedLayoutGap: BigNumber,
  children: (PanelSchema | PocketClusterSchema)[],
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedComponentSchema[] => {
  const boundingBoxes = calculateLayoutBoundingBoxes({
    component,
    children,
    computedGap: computedLayoutGap,
    boundingRect: layoutBoundingRect,
  })

  return children.map((child) =>
    computeComponent(
      child,
      boundingBoxes[child.id].boundingRect,
      boundingBoxes[child.id].layoutBoundingRect,
      parentBoundingRect,
      parentCornerRadius,
      subProject,
      resolvedStitchLines,
      computedComponents,
    ),
  )
}

const assertLayoutChildren = (children: ComponentSchema[]): (PanelSchema | PocketClusterSchema)[] => {
  return children.map((child) => {
    if (child.type !== 'panel' && child.type !== 'pocket-cluster') {
      throw new Error(`Unsupported child component type: ${child.type}`)
    }

    return child
  })
}

const getSubProjectViewBox = (
  components: ComputedComponentSchema[],
  stitchLines: ComputedStitchLineSchema[],
): RectSchema => {
  const cards = components
    .filter(narrowers.is.computedPocketCluster)
    .flatMap((c): HasComputedCardSchema[] => [c.frontPocket, ...c.tPockets])
    .flatMap((p): ComputedCardSchema[] => (isDefined(p.card) ? [p.card] : []))
  const withBoundingRects: HasBoundingRectSchema[] = [...components, ...stitchLines, ...cards]
  const boundingRects: RectSchema[] = withBoundingRects.map((e) => e.boundingRect)

  const firstBoundingRect = boundingRects[0]

  if (!isDefined(firstBoundingRect)) {
    throw new Error('Expected at least one bounding rect')
  }

  let minX = firstBoundingRect.x
  let minY = firstBoundingRect.y
  let maxX = firstBoundingRect.x.plus(firstBoundingRect.width)
  let maxY = firstBoundingRect.y.plus(firstBoundingRect.height)

  for (const boundingRect of boundingRects) {
    minX = BigNumber.minimum(minX, boundingRect.x)
    minY = BigNumber.minimum(minY, boundingRect.y)
    maxX = BigNumber.maximum(maxX, boundingRect.x.plus(boundingRect.width))
    maxY = BigNumber.maximum(maxY, boundingRect.y.plus(boundingRect.height))
  }
  return {
    x: minX,
    y: minY,
    width: maxX.minus(minX),
    height: maxY.minus(minY),
  }
}
