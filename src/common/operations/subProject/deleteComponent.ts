import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { canDeleteComponent } from './utils/componentRules'
import { getComponentDescendants } from './utils/getComponentDescendants'

export type DeleteComponentParams = {
  componentId: string
}

export const deleteComponent = (
  subProject: SubProjectSchema,
  { componentId }: DeleteComponentParams,
): SubProjectSchema => {
  const component = accessors.subProject(subProject).optional.component.byId(componentId)

  if (!isDefined(component) || !canDeleteComponent(component)) {
    return subProject
  }

  const deletedIds = new Set([componentId, ...getComponentDescendants(component, subProject)])

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
