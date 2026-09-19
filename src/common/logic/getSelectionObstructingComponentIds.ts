import { getComponentDescendants } from '../operations/subProject/utils/getComponentDescendants'
import type { ComponentSchema } from '../schemas/components'
import { HoleSchema } from '../schemas/hole'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'

const EmptySet: ReadonlySet<string> = new Set<string>()

export const getSelectionObstructingComponentIds = (
  selection: ModelObjectSchema | undefined,
  subProject: SubProjectSchema,
): ReadonlySet<string> => {
  if (!isDefined(selection)) {
    return EmptySet
  }
  if (narrowers.is.component(selection)) {
    return getComponentObstructingComponentIds(selection, subProject)
  }
  if (narrowers.is.stitchLine(selection)) {
    return getStitchLineObstructingComponentIds(selection, subProject)
  }
  if (narrowers.is.hole(selection)) {
    return getHoleObstructingComponentIds(selection, subProject)
  }
  return EmptySet
}

const getComponentObstructingComponentIds = (
  component: ComponentSchema,
  subProject: SubProjectSchema,
): ReadonlySet<string> => {
  if (component.type !== 'pocket-cluster') {
    return EmptySet
  }

  const obstructingComponentIds = new Set(getComponentDescendants(component, subProject))
  obstructingComponentIds.delete(component.id)

  return obstructingComponentIds
}

const getStitchLineObstructingComponentIds = (
  stitchLine: StitchLineSchema,
  subProject: SubProjectSchema,
): ReadonlySet<string> => {
  const ownerComponent = getStitchLineOwnerComponent(stitchLine, subProject)

  if (!isDefined(ownerComponent)) {
    return EmptySet
  }

  const coveredComponentIds = new Set(getComponentDescendants(ownerComponent, subProject))
  coveredComponentIds.delete(ownerComponent.id)

  if (ownerComponent.type === 'pocket-cluster' && stitchLine.type === 'pocket-cluster-stitch-line') {
    coveredComponentIds.add(ownerComponent.id)
  }

  return coveredComponentIds
}

const getHoleObstructingComponentIds = (hole: HoleSchema, subProject: SubProjectSchema): ReadonlySet<string> => {
  const ownerComponent = subProject.components[hole.componentId]

  if (!isDefined(ownerComponent)) {
    return EmptySet
  }

  const obstructingComponentIds = new Set(getComponentDescendants(ownerComponent, subProject))
  obstructingComponentIds.delete(ownerComponent.id)

  return obstructingComponentIds
}

const getStitchLineOwnerComponent = (
  stitchLine: StitchLineSchema,
  subProject: SubProjectSchema,
): ComponentSchema | undefined => {
  if (stitchLine.targetType === 'component') {
    return subProject.components[stitchLine.targetId]
  }
  const targetHole = subProject.holes.find((hole) => hole.id === stitchLine.targetId)
  return isDefined(targetHole) ? subProject.components[targetHole.componentId] : undefined
}
