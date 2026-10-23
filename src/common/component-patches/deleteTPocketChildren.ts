import { getComponentDescendants } from '../operations/subProject/utils/getComponentDescendants'
import { ComponentSchema } from '../schemas/components'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'

export const deleteTPocketChildren = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const deleted = new Set<string>()
  const parents = new Set<string>()
  for (const component of Object.values(subProject.components)) {
    if (component.type !== 't-pocket' || component.children.length === 0) {
      continue
    }
    parents.add(component.id)
    for (const childId of component.children) {
      const child = subProject.components[childId]
      deleted.add(childId)
      if (isDefined(child)) {
        getComponentDescendants(child, subProject).forEach((id) => deleted.add(id))
      }
    }
  }
  if (parents.size === 0) {
    return subProject
  }
  return {
    ...subProject,
    components: Object.fromEntries(
      Object.entries(subProject.components)
        .filter(([id]) => !deleted.has(id))
        .map(([id, component]): [string, ComponentSchema] => [
          id,
          parents.has(id) ? { ...component, children: [] } : component,
        ]),
    ),
  }
}
