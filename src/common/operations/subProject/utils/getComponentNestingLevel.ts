import type { ComponentSchema } from '../../../schemas/components'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { isDefined } from '../../../utils/isDefined'

export const getComponentNestingLevel = (componentId: string, subProject: SubProjectSchema): number => {
  const rootComponent = subProject.components[subProject.root]

  if (!isDefined(rootComponent)) {
    return 0
  }

  return findComponentNestingLevel(componentId, rootComponent, subProject) ?? 0
}

const findComponentNestingLevel = (
  componentId: string,
  component: ComponentSchema,
  subProject: SubProjectSchema,
  currentNestingLevel = 0,
): number | undefined => {
  if (component.id === componentId) {
    return currentNestingLevel
  }

  for (const childId of component.children) {
    const child = subProject.components[childId]

    if (!isDefined(child)) {
      continue
    }

    const childNestingLevel = findComponentNestingLevel(componentId, child, subProject, currentNestingLevel + 1)

    if (isDefined(childNestingLevel)) {
      return childNestingLevel
    }
  }

  return undefined
}
