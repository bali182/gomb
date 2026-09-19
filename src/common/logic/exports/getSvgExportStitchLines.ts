import { getComponentDescendants } from '../../operations/subProject/utils/getComponentDescendants'
import { getComponentParent } from '../../operations/subProject/utils/getComponentParent'
import type {
  ComputedPanelSchema,
  ComputedRootPanelSchema,
  ComputedStitchLineSchema,
  ComputedStitchRouteSchema,
  ComputedTopPocketSchema,
  ComputedTPocketSchema,
} from '../../schemas/computed'
import type { PathSchema } from '../../schemas/geometry'
import type { ExportStitchLineModeSchema } from '../../schemas/settings'
import type { StitchLineCommonConfigSchema, StitchLineSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import type { SvgExportStitchLineSchema } from '../../schemas/svgExport'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { clipPathToClosedPath } from '../clipPathToClosedPath'
import { isPointInClosedPath } from '../isPointInClosedPath'

type ComputedSvgExportStitchLineTarget =
  | ComputedRootPanelSchema
  | ComputedPanelSchema
  | ComputedTopPocketSchema
  | ComputedTPocketSchema

export const getSvgExportStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  target: ComputedSvgExportStitchLineTarget,
  stitchLineMode: ExportStitchLineModeSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportStitchLineSchema[] => {
  const candidateStitchLines = getCandidateStitchLines(computedSubProject, subProject, target, stitchLineMode)
  const accessor = accessors.subProject(subProject)

  return candidateStitchLines.flatMap((computedStitchLine) => {
    const stitchLine = accessor.stitchLine(computedStitchLine.stitchLineId)
    const svgExportStitchLine = getSvgExportStitchLine(
      stitchLine,
      computedStitchLine,
      stitchingSettings,
      target.path,
      getExportRoutes(computedSubProject, stitchLine, computedStitchLine, target, stitchLineMode),
    )

    return isDefined(svgExportStitchLine) ? [svgExportStitchLine] : []
  })
}

const getTargetComponentId = (target: ComputedSvgExportStitchLineTarget): string => {
  switch (target.type) {
    case 'computed-root-panel':
    case 'computed-panel':
    case 'computed-top-pocket':
    case 'computed-t-pocket':
      return target.componentId
  }
}

const getCandidateStitchLines = (
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  target: ComputedSvgExportStitchLineTarget,
  stitchLineMode: ExportStitchLineModeSchema,
): ComputedStitchLineSchema[] => {
  switch (stitchLineMode) {
    case 'own-stitch-lines':
      return computedSubProject.stitchLines[getTargetComponentId(target)] ?? []
    case 'all-stitch-lines':
      return Object.values(computedSubProject.stitchLines).flat()
    case 'related-stitch-lines':
      return getContainedStitchLines(computedSubProject, subProject, target)
  }
}

const getContainedStitchLines = (
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  target: ComputedSvgExportStitchLineTarget,
): ComputedStitchLineSchema[] => {
  switch (target.type) {
    case 'computed-root-panel':
    case 'computed-panel': {
      const component = accessors.subProject(subProject).component(target.componentId)
      const componentIds = getComponentDescendants(component, subProject)
      return getComputedStitchLinesForComponents(computedSubProject, [
        ...componentIds,
        ...getSiblingsRenderingOnTop(component.id, subProject),
      ])
    }
    case 'computed-top-pocket':
      return getPocketClusterFrontPocketStitchLines(computedSubProject, subProject, target.componentId)
    case 'computed-t-pocket':
      return getPocketClusterTPocketStitchLines(computedSubProject, subProject, target.componentId)
  }
}

const getSiblingsRenderingOnTop = (componentId: string, subProject: SubProjectSchema): string[] => {
  const siblings = getComponentParent(componentId, subProject)?.children ?? []
  const componentIndex = siblings.indexOf(componentId)

  if (componentIndex === -1) {
    return []
  }

  const accessor = accessors.subProject(subProject)
  const componentIds: string[] = []

  for (const siblingId of siblings.slice(componentIndex + 1)) {
    const sibling = accessor.optional.component(siblingId)

    if (isDefined(sibling)) {
      componentIds.push(...getComponentDescendants(sibling, subProject))
    }
  }

  return componentIds
}

const getPocketClusterFrontPocketStitchLines = (
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  componentId: string,
): ComputedStitchLineSchema[] => {
  const pocketCluster = accessors.subProject(subProject).component(componentId)
  const descendantIds = getComponentDescendants(pocketCluster, subProject)
  const directChildPocketClusterIds = Array.from(
    new Set(pocketCluster.children.filter((childId) => subProject.components[childId]?.type === 'pocket-cluster')),
  )

  return [
    ...getComputedStitchLinesForComponents(
      computedSubProject,
      [...descendantIds, ...getSiblingsRenderingOnTop(componentId, subProject)],
      'component-bounds-stitch-line',
    ),
    ...getComputedStitchLinesForComponents(
      computedSubProject,
      directChildPocketClusterIds,
      'pocket-cluster-stitch-line',
    ),
  ]
}

const getPocketClusterTPocketStitchLines = (
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  componentId: string,
): ComputedStitchLineSchema[] => {
  const pocketCluster = accessors.subProject(subProject).component(componentId)
  const descendantIds = [
    ...getComponentDescendants(pocketCluster, subProject),
    ...getSiblingsRenderingOnTop(componentId, subProject),
  ]

  return [
    ...getComputedStitchLinesForComponents(computedSubProject, descendantIds, 'component-bounds-stitch-line'),
    ...getComputedStitchLinesForComponents(computedSubProject, [componentId], 'pocket-cluster-stitch-line'),
  ]
}

const getComputedStitchLinesForComponents = (
  computedSubProject: ComputedSubProjectSchema,
  componentIds: string[],
  stitchLineType?: ComputedStitchLineSchema['type'],
): ComputedStitchLineSchema[] => {
  const stitchLines: ComputedStitchLineSchema[] = []

  for (const componentId of componentIds) {
    for (const stitchLine of computedSubProject.stitchLines[componentId] ?? []) {
      if (isDefined(stitchLineType) && stitchLine.type !== stitchLineType) {
        continue
      }

      stitchLines.push(stitchLine)
    }
  }

  return stitchLines
}

const getSvgExportStitchLine = (
  stitchLine: StitchLineSchema,
  computedStitchLine: ComputedStitchLineSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
  clippingPath: PathSchema,
  routes: ComputedStitchRouteSchema[],
): SvgExportStitchLineSchema | undefined => {
  const paths = routes.flatMap((route) => clipPathToClosedPath(route.path, clippingPath))
  const holes = routes.flatMap((route) => {
    return route.holes.filter((hole) => isPointInClosedPath(hole.center, clippingPath))
  })

  if (paths.length === 0 && holes.length === 0) {
    return undefined
  }

  return {
    stitchLine: getResolvedStitchLine(stitchLine, stitchingSettings),
    paths,
    holes,
  }
}

const getExportRoutes = (
  computedProject: ComputedSubProjectSchema,
  stitchLine: StitchLineSchema,
  computedStitchLine: ComputedStitchLineSchema,
  target: ComputedSvgExportStitchLineTarget,
  stitchLineMode: ExportStitchLineModeSchema,
): ComputedStitchRouteSchema[] => {
  if (stitchLineMode === 'all-stitch-lines' || stitchLine.type !== 'pocket-cluster-stitch-line') {
    return computedStitchLine.routes
  }

  if (target.type === 'computed-top-pocket') {
    return computedStitchLine.componentId === target.componentId ? [] : computedStitchLine.routes
  }

  if (target.type !== 'computed-t-pocket') {
    return computedStitchLine.routes
  }

  if (computedStitchLine.componentId !== target.componentId) {
    return []
  }

  const ownerComponent = computedProject.components[target.componentId]

  if (!isDefined(ownerComponent) || ownerComponent.type !== 'computed-pocket-cluster') {
    return []
  }

  const pocketIndex = ownerComponent.tPockets.findIndex((pocket) => pocket.id === target.id)
  const route = computedStitchLine.routes[pocketIndex]

  return isDefined(route) ? [route] : []
}
