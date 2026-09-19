import type { SubProjectSchema } from '../../../schemas/subProject'

export const getComponentAncestorIds = (componentId: string, subProject: SubProjectSchema): string[] => {
  const parentIdsByChildId = new Map<string, string>()

  for (const component of Object.values(subProject.components)) {
    for (const childId of component.children) {
      parentIdsByChildId.set(childId, component.id)
    }
  }

  const ancestorIds: string[] = []
  let parentId = parentIdsByChildId.get(componentId)

  while (parentId) {
    ancestorIds.push(parentId)
    parentId = parentIdsByChildId.get(parentId)
  }

  return ancestorIds
}
