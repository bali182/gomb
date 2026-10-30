import type { ComponentSchema } from '../../../schemas/components'
import type { StitchLineSchema } from '../../../schemas/stitching'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import type { MoveComponentParams } from '../moveComponent'
import { getComponentDescendants } from './getComponentDescendants'

export const canAddChild = (
  parent: ComponentSchema,
  type: ComponentSchema['type'],
  subProject: SubProjectSchema,
): boolean => {
  switch (parent.type) {
    case 't-pocket':
      return false
    case 'pocket-cluster': {
      const accessor = accessors.subProject(subProject)
      const hasFrontPocket = parent.children.some((id) => {
        return isDefined(accessor.optional.component.frontPocket(id))
      })
      return (type === 't-pocket' && hasFrontPocket) || (type === 'front-pocket' && !hasFrontPocket)
    }
    default:
      return type === 'panel' || type === 'pocket-cluster'
  }
}

export const canDeleteComponent = (component: ComponentSchema): boolean =>
  !narrowers.is.rootPanel(component) && !narrowers.is.frontPocket(component)

export const canCloneComponent = (component: ComponentSchema): boolean =>
  !narrowers.is.rootPanel(component) && !narrowers.is.frontPocket(component)

export const canAddHole = (component: ComponentSchema): boolean => !narrowers.is.pocketCluster(component)

const componentStitchLineTypes: Record<ComponentSchema['type'], readonly StitchLineSchema['type'][]> = {
  'root-panel': ['component-bounds-stitch-line'],
  panel: ['component-bounds-stitch-line'],
  'front-pocket': ['component-bounds-stitch-line'],
  't-pocket': ['t-pocket-stitch-line'],
  'pocket-cluster': ['component-bounds-stitch-line', 't-pocket-stitch-line'],
}

export const getComponentStitchLineTypes = (component: ComponentSchema): readonly StitchLineSchema['type'][] => {
  return componentStitchLineTypes[component.type]
}

export const canAddStitchLine = (
  component: ComponentSchema,
  subProject: SubProjectSchema,
  type: StitchLineSchema['type'],
): boolean => {
  if (!getComponentStitchLineTypes(component).includes(type)) {
    return false
  }
  if (narrowers.is.pocketCluster(component)) {
    const accessor = accessors.subProject(subProject)
    return component.children.some((id) => {
      return isDefined(accessor.optional.component.frontPocket(id))
    })
  }
  return true
}

export const canMoveComponent = (subProject: SubProjectSchema, params: MoveComponentParams): boolean => {
  const accessor = accessors.subProject(subProject)
  const component = accessor.optional.component.byId(params.componentId)
  const parent = accessor.optional.component.byId(params.targetParentId)
  if (!isDefined(component) || !isDefined(parent) || !canDeleteComponent(component) || component.id === parent.id) {
    return false
  }
  if (
    !canAddChild(parent, component.type, subProject) ||
    !isDefined(accessor.optional.component.parent(component.id))
  ) {
    return false
  }
  if (getComponentDescendants(component, subProject).includes(parent.id)) {
    return false
  }
  const children = parent.children.filter((id) => id !== component.id)
  if (isDefined(params.beforeComponentId) && !children.includes(params.beforeComponentId)) {
    return false
  }
  if (narrowers.is.pocketCluster(parent)) {
    const frontIndex = children.findIndex((id) => {
      return isDefined(accessor.optional.component.frontPocket(id))
    })
    if (!isDefined(params.beforeComponentId)) {
      return frontIndex === -1
    }
    return frontIndex === -1 || children.indexOf(params.beforeComponentId) <= frontIndex
  }
  return true
}
