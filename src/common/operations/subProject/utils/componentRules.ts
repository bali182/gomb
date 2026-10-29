import type { ComponentSchema } from '../../../schemas/components'
import type { StitchLineSchema } from '../../../schemas/stitching'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { isDefined } from '../../../utils/isDefined'
import type { MoveComponentParams } from '../moveComponent'
import { getComponentDescendants } from './getComponentDescendants'
import { getComponentParent } from './getComponentParent'

export const canAddChild = (
  parent: ComponentSchema,
  type: ComponentSchema['type'],
  subProject: SubProjectSchema,
): boolean => {
  switch (parent.type) {
    case 't-pocket':
      return false
    case 'pocket-cluster': {
      const hasFrontPocket = parent.children.some((id) => subProject.components[id]?.type === 'front-pocket')
      return (type === 't-pocket' && hasFrontPocket) || (type === 'front-pocket' && !hasFrontPocket)
    }
    default:
      return type === 'panel' || type === 'pocket-cluster'
  }
}

export const canDeleteComponent = (component: ComponentSchema): boolean =>
  component.type !== 'root-panel' && component.type !== 'front-pocket'

export const canCloneComponent = (component: ComponentSchema): boolean =>
  component.type !== 'root-panel' && component.type !== 'front-pocket'

export const canAddHole = (component: ComponentSchema): boolean => component.type !== 'pocket-cluster'

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
  if (component.type === 'pocket-cluster') {
    return component.children.some((id) => subProject.components[id]?.type === 'front-pocket')
  }
  return true
}

export const canMoveComponent = (subProject: SubProjectSchema, params: MoveComponentParams): boolean => {
  const component = subProject.components[params.componentId]
  const parent = subProject.components[params.targetParentId]
  if (!isDefined(component) || !isDefined(parent) || !canDeleteComponent(component) || component.id === parent.id) {
    return false
  }
  if (!canAddChild(parent, component.type, subProject) || !isDefined(getComponentParent(component.id, subProject))) {
    return false
  }
  if (getComponentDescendants(component, subProject).includes(parent.id)) {
    return false
  }
  const children = parent.children.filter((id) => id !== component.id)
  if (isDefined(params.beforeComponentId) && !children.includes(params.beforeComponentId)) {
    return false
  }
  if (parent.type === 'pocket-cluster') {
    const frontIndex = children.findIndex((id) => subProject.components[id]?.type === 'front-pocket')
    if (!isDefined(params.beforeComponentId)) {
      return frontIndex === -1
    }
    return frontIndex === -1 || children.indexOf(params.beforeComponentId) <= frontIndex
  }
  return true
}
