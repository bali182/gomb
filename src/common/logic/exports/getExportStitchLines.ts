import { getComponentDescendants } from '../../operations/subProject/utils/getComponentDescendants'
import { getComponentParent } from '../../operations/subProject/utils/getComponentParent'
import type { ComputedComponentSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ExportStitchLineSchema } from '../../schemas/export'
import type { PathSchema } from '../../schemas/geometry'
import type { ExportStitchLineModeSchema } from '../../schemas/settings'
import type { StitchLineCommonConfigSchema, StitchLineSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { clipPathToClosedPath } from '../clipPathToClosedPath'
import { isPointInClosedPath } from '../isPointInClosedPath'

export const getExportStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  target: ComputedComponentSchema,
  stitchLineMode: ExportStitchLineModeSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportStitchLineSchema[] => {
  const candidates = getCandidateStitchLines(subProject, computedSubProject, target, stitchLineMode)
  const accessor = accessors.subProject(subProject)

  return candidates.flatMap((computedStitchLine) => {
    const stitchLine = accessor.optional.stitchLine(computedStitchLine.stitchLineId)
    if (!isDefined(stitchLine)) {
      return []
    }
    const exportStitchLine = getExportStitchLine(stitchLine, computedStitchLine, stitchingSettings, target.path)
    return isDefined(exportStitchLine) ? [exportStitchLine] : []
  })
}

const getCandidateStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  target: ComputedComponentSchema,
  stitchLineMode: ExportStitchLineModeSchema,
): ComputedStitchLineSchema[] => {
  switch (stitchLineMode) {
    case 'all-stitch-lines':
      return Object.values(computedSubProject.stitchLines).flat()
    case 'own-stitch-lines':
      return getOwnStitchLines(subProject, computedSubProject, target.componentId)
    case 'related-stitch-lines':
      return getRelatedStitchLines(subProject, computedSubProject, target)
  }
}

const getOwnStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  componentId: string,
): ComputedStitchLineSchema[] => {
  const ownStitchLines = computedSubProject.stitchLines[componentId] ?? []
  const parent = getComponentParent(componentId, subProject)
  if (!isDefined(parent) || parent.type !== 'pocket-cluster') {
    return ownStitchLines
  }

  // The cluster owns no material. Its shared stitching is exported on the physical pockets.
  const clusterStitchLines = (computedSubProject.stitchLines[parent.id] ?? []).filter(
    (stitchLine) => stitchLine.type === 'component-bounds-stitch-line',
  )
  return [...ownStitchLines, ...clusterStitchLines]
}

const getRelatedStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  target: ComputedComponentSchema,
): ComputedStitchLineSchema[] => {
  const source = subProject.components[target.componentId]
  if (!isDefined(source)) {
    return []
  }
  const componentIds = new Set([
    ...getComponentDescendants(source, subProject),
    ...getFollowingSiblingSubtreeIds(source.id, subProject),
  ])
  let parent = getComponentParent(source.id, subProject)
  while (isDefined(parent) && parent.type === 'pocket-cluster') {
    componentIds.add(parent.id)
    parent = getComponentParent(parent.id, subProject)
  }

  return Object.values(computedSubProject.stitchLines)
    .flat()
    .filter((stitchLine) => {
      if (!componentIds.has(stitchLine.componentId)) {
        return false
      }
      if (target.type === 'computed-front-pocket' || target.type === 'computed-t-pocket') {
        // A T-pocket's bottom stitching belongs only to that physical pocket.
        if (stitchLine.type === 't-pocket-stitch-line' && stitchLine.componentId !== target.componentId) {
          return false
        }
      }
      return true
    })
}

const getFollowingSiblingSubtreeIds = (componentId: string, subProject: SubProjectSchema): string[] => {
  const siblings = getComponentParent(componentId, subProject)?.children ?? []
  const componentIds: string[] = []
  for (const siblingId of siblings.slice(siblings.indexOf(componentId) + 1)) {
    const sibling = subProject.components[siblingId]
    if (isDefined(sibling)) {
      componentIds.push(...getComponentDescendants(sibling, subProject))
    }
  }
  return componentIds
}

const getExportStitchLine = (
  stitchLine: StitchLineSchema,
  computedStitchLine: ComputedStitchLineSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
  clippingPath: PathSchema,
): ExportStitchLineSchema | undefined => {
  const paths = computedStitchLine.routes.flatMap((route) => clipPathToClosedPath(route.path, clippingPath))
  const holes = computedStitchLine.routes.flatMap((route) =>
    route.holes.filter((hole) => isPointInClosedPath(hole.center, clippingPath)),
  )
  if (paths.length === 0 && holes.length === 0) {
    return undefined
  }
  const element: ExportStitchLineSchema = {
    stitchLine: getResolvedStitchLine(stitchLine, stitchingSettings),
    paths,
    holes,
  }
  return element
}
