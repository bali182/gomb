import { ComponentSchema } from '../schemas/components'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'

export const deleteTPocketChildren = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const deleted = new Set<string>()
  const parents = new Set<string>()
  for (const component of Object.values(subProject.components)) {
    if (!narrowers.is.tPocket(component) || component.children.length === 0) {
      continue
    }
    parents.add(component.id)
    for (const childId of accessor.component.descendantIds(component.id)) {
      deleted.add(childId)
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
          parents.has(id) && narrowers.is.tPocket(component) ? { ...component, children: [] } : component,
        ]),
    ),
  }
}
