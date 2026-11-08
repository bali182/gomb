import type { BaseOperationParamsSchema, DeleteComponentParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { canDeleteComponent } from './utils/componentRules'
import { getComponentDescendants } from './utils/getComponentDescendants'

export const deleteComponent = (
  { subProject }: BaseOperationParamsSchema,
  { id }: DeleteComponentParamsSchema,
): SubProjectSchema => {
  const component = accessors.subProject(subProject).optional.component.byId(id)

  if (!isDefined(component) || !canDeleteComponent(component, subProject)) {
    return subProject
  }

  const deletedIds = new Set([id, ...getComponentDescendants(component, subProject)])

  return {
    ...subProject,
    components: Object.fromEntries(
      Object.entries(subProject.components)
        .filter(([id]) => !deletedIds.has(id))
        .map((tuple) => {
          const [id, component] = tuple
          if (!component.children.some((child) => deletedIds.has(child))) {
            return tuple
          }
          return [id, { ...component, children: component.children.filter((child) => !deletedIds.has(child)) }]
        }),
    ),
  }
}
