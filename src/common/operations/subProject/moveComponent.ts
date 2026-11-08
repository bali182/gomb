import type { BaseOperationParamsSchema, MoveComponentParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { canMoveComponent } from './utils/componentRules'
import { getComponentDescendants } from './utils/getComponentDescendants'

export const moveComponent = (
  { subProject }: BaseOperationParamsSchema,
  { beforeComponentId, id, targetParentId }: MoveComponentParamsSchema,
): SubProjectSchema => {
  if (!canMoveComponent(subProject, { beforeComponentId, id, targetParentId })) {
    return subProject
  }
  const accessor = accessors.subProject(subProject)
  const movedComponent = accessor.optional.component.byId(id)
  const targetParent = accessor.optional.component.byId(targetParentId)

  if (!isDefined(movedComponent) || narrowers.is.rootPanel(movedComponent) || !isDefined(targetParent)) {
    return subProject
  }

  if (getComponentDescendants(movedComponent, subProject).includes(targetParentId)) {
    return subProject
  }

  const sourceParent = accessor.optional.component.parent(id)

  if (!isDefined(sourceParent)) {
    return subProject
  }

  const sourceChildren = removeChild(sourceParent.children, id)
  const targetChildren = sourceParent.id === targetParent.id ? sourceChildren : targetParent.children
  const updatedTargetChildren = insertChildBefore(targetChildren, id, beforeComponentId)

  if (!isDefined(updatedTargetChildren)) {
    return subProject
  }

  if (sourceParent.id === targetParent.id && areEqualChildren(sourceParent.children, updatedTargetChildren)) {
    return subProject
  }

  return {
    ...subProject,
    components: {
      ...subProject.components,
      [sourceParent.id]: {
        ...sourceParent,
        children: sourceChildren,
      },
      [targetParent.id]: {
        ...targetParent,
        children: updatedTargetChildren,
      },
    },
  }
}

const removeChild = (children: string[], componentId: string): string[] => {
  return children.filter((childId) => childId !== componentId)
}

const insertChildBefore = (
  children: string[],
  componentId: string,
  beforeComponentId: string | undefined,
): string[] | undefined => {
  if (!isDefined(beforeComponentId)) {
    return [...children, componentId]
  }

  const index = children.indexOf(beforeComponentId)

  if (index < 0) {
    return undefined
  }

  return [...children.slice(0, index), componentId, ...children.slice(index)]
}

const areEqualChildren = (firstChildren: string[], secondChildren: string[]): boolean => {
  return (
    firstChildren.length === secondChildren.length &&
    firstChildren.every((childId, index) => childId === secondChildren[index])
  )
}
