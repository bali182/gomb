import type { ComponentSchema } from '../../../schemas/components'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'

export const getComponentNestingLevel = (componentId: string, subProject: SubProjectSchema): number => {
  const rootComponent = accessors.subProject(subProject).optional.component.rootPanel()

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

  const accessor = accessors.subProject(subProject)
  for (const child of accessor.optional.component.children(component.id)) {
    const childNestingLevel = findComponentNestingLevel(
      componentId,
      child,
      subProject,
      narrowers.is.pocketCluster(component) ? currentNestingLevel : currentNestingLevel + 1,
    )

    if (isDefined(childNestingLevel)) {
      return childNestingLevel
    }
  }

  return undefined
}
