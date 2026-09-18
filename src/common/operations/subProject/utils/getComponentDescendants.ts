import { ComponentSchema } from '../../../schemas/components'
import { SubProjectSchema } from '../../../schemas/subProject'
import { isDefined } from '../../../utils/isDefined'

const collectDescendantIds = (component: ComponentSchema, subProject: SubProjectSchema, ids: Set<string>): void => {
  component.children.forEach((childId) => {
    ids.add(childId)
    const child = subProject.components[childId]
    if (isDefined(child)) {
      collectDescendantIds(child, subProject, ids)
    }
  })
}

export const getComponentDescendants = (component: ComponentSchema, subProject: SubProjectSchema): string[] => {
  const ids = new Set<string>([component.id])
  collectDescendantIds(component, subProject, ids)
  return Array.from(ids)
}
