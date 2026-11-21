import type { BaseSubProjectOperationParamsSchema, DeleteComponentParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { canDeleteComponent } from './utils/componentRules'

export const deleteComponent = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeleteComponentParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const component = accessor.optional.component.byId(id)

  if (!isDefined(component) || !canDeleteComponent(component, subProject)) {
    return subProject
  }

  const deletedIds = new Set(accessor.component.descendantIds(id, true))

  return {
    ...subProject,
    components: Object.fromEntries(
      Object.entries(subProject.components)
        .filter(([id]) => !deletedIds.has(id))
        .map((tuple) => {
          const [id, component] = tuple
          if (narrowers.is.rootPanel(component) || !component.children.some((child) => deletedIds.has(child))) {
            return tuple
          }
          return [id, { ...component, children: component.children.filter((child) => !deletedIds.has(child)) }]
        }),
    ),
  }
}
