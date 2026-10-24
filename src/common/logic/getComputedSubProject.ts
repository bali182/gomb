import BigNumber from 'bignumber.js'
import { ZERO_CORNER_RADIUS } from '../constants/layout'

import { getComponentChildren } from '../operations/subProject/utils/getComponentChildren'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelSchema,
} from '../schemas/components'
import type {
  ComputedCardSchema,
  ComputedComponentSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedPocketSchema,
  ComputedRootPanelSchema,
  ComputedStitchLineSchema,
  HasBoundingRectSchema,
} from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { ResolvedStitchLineSchema, StitchLineCommonConfigSchema } from '../schemas/stitching'
import type {
  ComputedSubProjectGeometrySchema,
  ComputedSubProjectSchema,
  SubProjectSchema,
} from '../schemas/subProject'
import { getResolvedStitchLine } from '../utils/getResolvedStitchLine'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { applyHolePathsToComputedComponents } from './applyHolePathsToComputedComponents'
import { calculateGap } from './calculateGap'
import { calculateHoles } from './calculateHoles'
import { calculateLayoutBoundingBoxes } from './calculateLayoutBoundingBoxes'
import { calculatePocketClusterGeometry } from './calculatePocketClusterGeometry'
import { calculateRectPath } from './calculateRectPath'
import { unionClosedPaths } from './closedPathBooleanUtils'
import { getCornerRadius } from './cornerRadiusUtils'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'
import { getCornerRadiusLimits } from './limits/getCornerRadiusLimits'
import { getPocketClusterCornerRadiusLimits } from './limits/getPocketClusterCornerRadiusLimits'
import { getSubProjectLimits } from './limits/getSubProjectLimits'
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
  const stitchLines = calculateStitchLines(resolvedStitchLines, subProject, computedComponents, holes)
  applyHolePathsToComputedComponents(computedComponents, holes)

  updatePocketClusterPaths(computedComponents)

  const geometry: ComputedSubProjectGeometrySchema = {
    id: subProject.id,
    root: root.componentId,
    components: computedComponents,
    holes,
    stitchLines,
    viewBox: getSubProjectViewBox(Object.values(computedComponents), Object.values(stitchLines).flat()),
  }
  return { ...geometry, limits: getSubProjectLimits(subProject, geometry, stitchingSettings) }
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
    case 'front-pocket':
    case 't-pocket':
      throw new Error('Pockets must be calculated by their cluster')
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
  const requestedRadius = getCornerRadius(rootPanel)
  const cornerRadius = getAdjustedCornerRadius(
    requestedRadius,
    getCornerRadiusLimits({ boundingRect, cornerRadius: requestedRadius }),
  )
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
  const requestedRadius = getCornerRadius(panel)
  const cornerRadius = getAdjustedCornerRadius(
    requestedRadius,
    getCornerRadiusLimits({
      boundingRect,
      cornerRadius: requestedRadius,
      parentBoundingRect,
      parentCornerRadius,
    }),
  )
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
  const cornerRadius = getAdjustedCornerRadius(
    ZERO_CORNER_RADIUS,
    getPocketClusterCornerRadiusLimits({
      pocketCluster,
      boundingRect,
      cornerRadius: ZERO_CORNER_RADIUS,
      parentBoundingRect,
      parentCornerRadius,
    }),
  )
  const pockets = getComponentChildren(pocketCluster, subProject).filter(
    (child): child is PocketSchema => child.type === 'front-pocket' || child.type === 't-pocket',
  )
  const normalizedPocketCluster = normalizePocketCluster(
    { ...pocketCluster, children: pockets.map((pocket) => pocket.id) },
    boundingRect,
  )
  const geometry = calculatePocketClusterGeometry(normalizedPocketCluster, pockets, boundingRect, cornerRadius)
  completePocketChildren(geometry.children, subProject, resolvedStitchLines, computedComponents)
  const computed: ComputedPocketClusterSchema = {
    type: 'computed-pocket-cluster',
    componentId: pocketCluster.id,
    boundingRect,
    layoutBoundingRect,
    // Filled by updatePocketClusterPaths after hole subtraction.
    path: { commands: [] },
    cornerRadius,
    children: geometry.children,
  }

  computedComponents[pocketCluster.id] = computed

  return computed
}

const computeLayoutChildren = (
  component: RootPanelSchema | PanelSchema | FrontPocketSchema,
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
    .filter((component) => component.type === 'computed-front-pocket' || component.type === 'computed-t-pocket')
    .flatMap((pocket): ComputedCardSchema[] => (isDefined(pocket.card) ? [pocket.card] : []))
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

/**
 * Pocket geometry is calculated before the front pocket's normal child layout.
 * Complete the pockets in place so the cluster's children and the component map share the same instances.
 */
const completePocketChildren = (
  pockets: readonly ComputedPocketSchema[],
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): void => {
  for (const computedPocket of pockets) {
    if (computedPocket.type === 'computed-front-pocket') {
      const source = narrowers.assert.frontPocket(subProject.components[computedPocket.componentId])
      const layoutChildren = assertLayoutChildren(getComponentChildren(source, subProject))
      computedPocket.computedLayoutGap = calculateGap(layoutChildren, computedPocket.boundingRect, source)
      computedPocket.children = computeLayoutChildren(
        source,
        computedPocket.boundingRect,
        computedPocket.boundingRect,
        computedPocket.cornerRadius,
        computedPocket.computedLayoutGap,
        layoutChildren,
        subProject,
        resolvedStitchLines,
        computedComponents,
      )
    }
    computedComponents[computedPocket.componentId] = computedPocket
  }
}

/**
 * The cluster owns no material, so its selection contour is the union of its pockets.
 * Update its path after hole subtraction to include the pockets' finished cut contours.
 */
const updatePocketClusterPaths = (computedComponents: Record<string, ComputedComponentSchema>): void => {
  for (const component of Object.values(computedComponents)) {
    if (component.type !== 'computed-pocket-cluster') {
      continue
    }
    component.path = unionClosedPaths(
      { commands: [] },
      component.children.map((pocket) => pocket.path),
    )
  }
}
