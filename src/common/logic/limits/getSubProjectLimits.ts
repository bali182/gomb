import type { ComponentSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type {
  ComponentLimitsSchema,
  HoleLimitsSchema,
  StitchLineLimitsSchema,
  SubProjectLimitsSchema,
} from '../../schemas/limits'
import type { ResolvedStitchLineSchema, StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ComputedSubProjectGeometrySchema, SubProjectSchema } from '../../schemas/subProject'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { normalizePocketCluster } from '../normalizePocketCluster'
import type { ComponentBoundsStitchLineTarget } from '../stitching/helperTypes'
import { getComponentBoundsStitchLineLimits } from './getComponentBoundsStitchLineLimits'
import { getFrontPocketLimits } from './getFrontPocketLimits'
import { getHoleLimits } from './getHoleLimits'
import { getPanelLimits } from './getPanelLimits'
import { getPocketClusterLimits } from './getPocketClusterLimits'
import { getRootPanelLimits } from './getRootPanelLimits'
import { getTPocketLimits } from './getTPocketLimits'
import { getTPocketStitchLineLimits } from './getTPocketStitchLineLimits'

/** Uses completed geometry without rebuilding paths, layout, holes or stitch routes. */
export const getSubProjectLimits = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectGeometrySchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SubProjectLimitsSchema => ({
  components: collectComponentLimits(subProject, computedSubProject),
  holes: collectHoleLimits(subProject, computedSubProject),
  stitchLines: collectStitchLineLimits(subProject, computedSubProject, stitchingSettings),
})

const collectComponentLimits = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectGeometrySchema,
): Record<string, ComponentLimitsSchema> => {
  const limits: Record<string, ComponentLimitsSchema> = {}
  const parents: Record<string, ComputedComponentSchema> = {}
  for (const parent of Object.values(computedSubProject.components)) {
    for (const child of parent.children) {
      parents[child.componentId] = parent
    }
  }
  for (const computed of Object.values(computedSubProject.components)) {
    const component = subProject.components[computed.componentId]
    if (!isDefined(component)) {
      continue
    }
    const componentLimits = getComponentLimits(component, computed, parents[component.id], subProject)
    if (isDefined(componentLimits)) {
      limits[component.id] = componentLimits
    }
  }
  return limits
}

const collectHoleLimits = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectGeometrySchema,
): Record<string, HoleLimitsSchema> => {
  const limits: Record<string, HoleLimitsSchema> = {}
  for (const computed of computedSubProject.holes) {
    const hole = subProject.holes.find((candidate) => candidate.id === computed.holeId)
    const owner = computedSubProject.components[computed.componentId]
    if (isDefined(hole) && isDefined(owner)) {
      limits[hole.id] = getHoleLimits(hole, computed, owner)
    }
  }
  return limits
}

const collectStitchLineLimits = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectGeometrySchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): Record<string, StitchLineLimitsSchema> => {
  const limits: Record<string, StitchLineLimitsSchema> = {}
  const computedStitchLines = new Map(
    Object.values(computedSubProject.stitchLines)
      .flat()
      .map((line) => [line.stitchLineId, line]),
  )
  for (const source of subProject.stitchLines) {
    const computed = computedStitchLines.get(source.id)
    if (!isDefined(computed)) {
      continue
    }
    const stitchLine = getResolvedStitchLine(source, stitchingSettings)
    const stitchLineLimits = getStitchLineLimits(stitchLine, computed, computedSubProject)
    if (isDefined(stitchLineLimits)) {
      limits[source.id] = stitchLineLimits
    }
  }
  return limits
}

const getStitchLineLimits = (
  stitchLine: ResolvedStitchLineSchema,
  computed: ComputedStitchLineSchema,
  computedSubProject: ComputedSubProjectGeometrySchema,
): StitchLineLimitsSchema | undefined => {
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line': {
      const computedTarget =
        stitchLine.targetType === 'hole'
          ? computedSubProject.holes.find((hole) => hole.holeId === stitchLine.targetId)
          : computedSubProject.components[stitchLine.targetId]
      if (!isDefined(computedTarget)) {
        return undefined
      }
      const target: ComponentBoundsStitchLineTarget = {
        componentId: computedTarget.componentId,
        boundingRect: computedTarget.boundingRect,
        cornerRadius: computedTarget.cornerRadius,
      }
      return getComponentBoundsStitchLineLimits(stitchLine, computed, target)
    }
    case 't-pocket-stitch-line': {
      const cluster = computedSubProject.components[stitchLine.targetId]
      if (!isDefined(cluster) || (cluster.type !== 'computed-t-pocket' && cluster.type !== 'computed-pocket-cluster')) {
        return undefined
      }
      return getTPocketStitchLineLimits(stitchLine, computed, cluster)
    }
  }
}

const getComponentLimits = (
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  parent: ComputedComponentSchema | undefined,
  subProject: SubProjectSchema,
): ComponentLimitsSchema | undefined => {
  switch (component.type) {
    case 'root-panel':
      return getRootPanelLimits(component, narrowers.assert.computedRootPanel(computed))
    case 'panel':
      if (!isDefined(parent)) {
        return undefined
      }
      return getPanelLimits(component, narrowers.assert.computedPanel(computed), parent)
    case 'front-pocket': {
      if (!isDefined(parent) || parent.type !== 'computed-pocket-cluster') {
        return undefined
      }
      const cluster = subProject.components[parent.componentId]
      if (!isDefined(cluster) || cluster.type !== 'pocket-cluster') {
        return undefined
      }
      return getFrontPocketLimits(
        component,
        narrowers.assert.computedFrontPocket(computed),
        normalizePocketCluster(cluster, parent.boundingRect),
        parent,
      )
    }
    case 't-pocket': {
      if (!isDefined(parent) || parent.type !== 'computed-pocket-cluster') {
        return undefined
      }
      const cluster = subProject.components[parent.componentId]
      if (!isDefined(cluster) || cluster.type !== 'pocket-cluster') {
        return undefined
      }
      return getTPocketLimits(
        component,
        narrowers.assert.computedTPocket(computed),
        normalizePocketCluster(cluster, parent.boundingRect),
      )
    }
    case 'pocket-cluster':
      if (!isDefined(parent)) {
        return undefined
      }
      return getPocketClusterLimits(component, narrowers.assert.computedPocketCluster(computed), parent)
  }
}
