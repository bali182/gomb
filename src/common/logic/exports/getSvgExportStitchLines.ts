import { getComponentDescendants } from '../../operations/subProject/utils/getComponentDescendants'
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
  const candidateStitchLines = getCandidateStitchLines(
    subProject.stitchLines,
    computedSubProject,
    subProject,
    target,
    stitchLineMode,
  )

  return candidateStitchLines.flatMap((stitchLine) => {
    const computedStitchLine = accessors.computedSubProject(computedSubProject).stitchLine(stitchLine.id)
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
  stitchLines: StitchLineSchema[],
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  target: ComputedSvgExportStitchLineTarget,
  stitchLineMode: ExportStitchLineModeSchema,
): StitchLineSchema[] => {
  switch (stitchLineMode) {
    case 'own-stitch-lines':
      return stitchLines.filter((stitchLine) => {
        const computedStitchLine = accessors.computedSubProject(computedSubProject).stitchLine(stitchLine.id)
        return computedStitchLine.componentId === getTargetComponentId(target)
      })
    case 'all-stitch-lines':
      return stitchLines
    case 'related-stitch-lines':
      return getContainedStitchLines(stitchLines, computedSubProject, subProject, target)
  }
}

const getContainedStitchLines = (
  stitchLines: StitchLineSchema[],
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  target: ComputedSvgExportStitchLineTarget,
): StitchLineSchema[] => {
  switch (target.type) {
    case 'computed-root-panel':
    case 'computed-panel': {
      const component = accessors.subProject(subProject).component(target.componentId)
      const componentIds = new Set(getComponentDescendants(component, subProject))
      return stitchLines.filter((stitchLine) => {
        const computedStitchLine = accessors.computedSubProject(computedSubProject).stitchLine(stitchLine.id)
        return componentIds.has(computedStitchLine.componentId)
      })
    }
    case 'computed-top-pocket':
      return getPocketClusterFrontPocketStitchLines(stitchLines, computedSubProject, subProject, target.componentId)
    case 'computed-t-pocket':
      return getPocketClusterTPocketStitchLines(stitchLines, computedSubProject, subProject, target.componentId)
  }
}

const getPocketClusterFrontPocketStitchLines = (
  stitchLines: StitchLineSchema[],
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  componentId: string,
): StitchLineSchema[] => {
  const pocketCluster = accessors.subProject(subProject).component(componentId)
  const descendantIds = new Set(getComponentDescendants(pocketCluster, subProject))
  const directChildPocketClusterIds = new Set(
    pocketCluster.children.filter((childId) => subProject.components[childId]?.type === 'pocket-cluster'),
  )

  return stitchLines.filter((stitchLine) => {
    const computedStitchLine = accessors.computedSubProject(computedSubProject).stitchLine(stitchLine.id)
    return (
      (stitchLine.type === 'component-bounds-stitch-line' && descendantIds.has(computedStitchLine.componentId)) ||
      (stitchLine.type === 'pocket-cluster-stitch-line' &&
        directChildPocketClusterIds.has(computedStitchLine.componentId))
    )
  })
}

const getPocketClusterTPocketStitchLines = (
  stitchLines: StitchLineSchema[],
  computedSubProject: ComputedSubProjectSchema,
  subProject: SubProjectSchema,
  componentId: string,
): StitchLineSchema[] => {
  const pocketCluster = accessors.subProject(subProject).component(componentId)
  const descendantIds = new Set(getComponentDescendants(pocketCluster, subProject))

  return stitchLines.filter((stitchLine) => {
    const computedStitchLine = accessors.computedSubProject(computedSubProject).stitchLine(stitchLine.id)
    return (
      (stitchLine.type === 'component-bounds-stitch-line' && descendantIds.has(computedStitchLine.componentId)) ||
      (stitchLine.type === 'pocket-cluster-stitch-line' && computedStitchLine.componentId === componentId)
    )
  })
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
