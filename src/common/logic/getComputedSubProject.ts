import BigNumber from 'bignumber.js'
import { POSITION_EPSILON } from '../constants/layout'
import { accessors } from '../utils/accessors'

import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
} from '../schemas/components'
import type {
  ComputedComponentSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedPocketItemSchema,
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
  const rootComponent = accessors.subProject(subProject).component.rootPanel()

  const computedComponents: Record<string, ComputedComponentSchema> = {}
  const resolvedStitchLines = subProject.stitchLines.map((stitchLine) =>
    getResolvedStitchLine(stitchLine, stitchingSettings),
  )
  const rootBoundingRect: RectSchema = {
    x: new BigNumber(0),
    y: new BigNumber(0),
    width: BigNumber.maximum(rootComponent.width, POSITION_EPSILON),
    height: BigNumber.maximum(rootComponent.height, POSITION_EPSILON),
  }
  const root = computeRootPanel(rootComponent, rootBoundingRect, subProject, resolvedStitchLines, computedComponents)
  const holes = calculateHoles(subProject.holes, computedComponents)
  const stitchLines = calculateStitchLines(resolvedStitchLines, subProject, computedComponents, holes)
  applyHolePathsToComputedComponents(computedComponents, Object.values(holes))

  updatePocketClusterPaths(computedComponents)

  const geometry: ComputedSubProjectGeometrySchema = {
    id: subProject.id,
    root: root.componentId,
    components: computedComponents,
    holes,
    stitchLines,
    viewBox: getSubProjectViewBox(Object.values(computedComponents), Object.values(stitchLines)),
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
  if (narrowers.is.rootPanel(component) || !isDefined(parentBoundingRect) || !isDefined(parentCornerRadius)) {
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
  const layoutChildren = assertLayoutChildren(accessors.subProject(subProject).component.children(rootPanel.id))
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
  const layoutChildren = assertLayoutChildren(accessors.subProject(subProject).component.children(panel.id))
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
  const requestedRadius = getCornerRadius(pocketCluster)
  const cornerRadius = getAdjustedCornerRadius(
    requestedRadius,
    getPocketClusterCornerRadiusLimits({
      pocketCluster,
      boundingRect,
      cornerRadius: requestedRadius,
      parentBoundingRect,
      parentCornerRadius,
    }),
  )
  const pockets = accessors.subProject(subProject).component.children(pocketCluster.id).filter(narrowers.is.pocket)
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
    children: geometry.children.map((pocket) => pocket.componentId),
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
): string[] => {
  const boundingBoxes = calculateLayoutBoundingBoxes({
    component,
    children,
    computedGap: computedLayoutGap,
    boundingRect: layoutBoundingRect,
  })

  return children.map(
    (child) =>
      computeComponent(
        child,
        boundingBoxes[child.id].boundingRect,
        boundingBoxes[child.id].layoutBoundingRect,
        parentBoundingRect,
        parentCornerRadius,
        subProject,
        resolvedStitchLines,
        computedComponents,
      ).componentId,
  )
}

const assertLayoutChildren = (children: ComponentSchema[]): (PanelSchema | PocketClusterSchema)[] => {
  return children.map((child) => {
    if (!narrowers.is.panel(child) && !narrowers.is.pocketCluster(child)) {
      throw new Error(`Unsupported child component type: ${child.type}`)
    }

    return child
  })
}

const getSubProjectViewBox = (
  components: ComputedComponentSchema[],
  stitchLines: ComputedStitchLineSchema[],
): RectSchema => {
  const items = components
    .filter((component) => narrowers.is.computedFrontPocket(component) || narrowers.is.computedTPocket(component))
    .flatMap((pocket): ComputedPocketItemSchema[] => (isDefined(pocket.item) ? [pocket.item] : []))
  const withBoundingRects: HasBoundingRectSchema[] = [...components, ...stitchLines, ...items]
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
 * Complete each pocket's child IDs before registering it in the component map.
 */
const completePocketChildren = (
  pockets: readonly ComputedPocketSchema[],
  subProject: SubProjectSchema,
  resolvedStitchLines: ResolvedStitchLineSchema[],
  computedComponents: Record<string, ComputedComponentSchema>,
): void => {
  const accessor = accessors.subProject(subProject)
  for (const computedPocket of pockets) {
    if (narrowers.is.computedFrontPocket(computedPocket)) {
      const source = accessor.component.frontPocket(computedPocket.componentId)
      const layoutChildren = assertLayoutChildren(accessor.component.children(source.id))
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
 * An empty cluster uses its rounded bounding rectangle as an editor-only placeholder.
 */
const updatePocketClusterPaths = (computedComponents: Record<string, ComputedComponentSchema>): void => {
  for (const component of Object.values(computedComponents)) {
    if (!narrowers.is.computedPocketCluster(component)) {
      continue
    }
    component.path =
      component.children.length === 0
        ? calculateRectPath(component.boundingRect, component.cornerRadius)
        : unionClosedPaths(
            { commands: [] },
            component.children.map((pocketId) => computedComponents[pocketId].path),
          )
  }
}
