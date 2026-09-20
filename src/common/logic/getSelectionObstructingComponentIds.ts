import { getComponentDescendants } from '../operations/subProject/utils/getComponentDescendants'
import type { ComponentSchema } from '../schemas/components'
import { HoleSchema } from '../schemas/hole'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
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
  const underlyingComponent = getStitchLineUnderlyingComponent(stitchLine, subProject)

  if (!isDefined(underlyingComponent)) {
    return EmptySet
  }

  const coveredComponentIds = new Set(getComponentDescendants(underlyingComponent, subProject))
  coveredComponentIds.delete(underlyingComponent.id)

  if (underlyingComponent.type === 'pocket-cluster' && stitchLine.type === 'pocket-cluster-stitch-line') {
    coveredComponentIds.add(underlyingComponent.id)
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

const getStitchLineUnderlyingComponent = (
  stitchLine: StitchLineSchema,
  subProject: SubProjectSchema,
): ComponentSchema | undefined => {
  const accessor = accessors.subProject(subProject)

  if (stitchLine.type === 'component-bounds-stitch-line' && isDefined(stitchLine.onTop)) {
    const renderTarget = accessor.optional.component(stitchLine.onTop)
    if (isDefined(renderTarget)) {
      return renderTarget
    }
  }

  if (stitchLine.targetType === 'component') {
    return accessor.optional.component(stitchLine.targetId)
  }
  const targetHole = accessor.optional.hole(stitchLine.targetId)
  return isDefined(targetHole) ? accessor.optional.component(targetHole.componentId) : undefined
}
