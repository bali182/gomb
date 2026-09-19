import { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { getComponentDescendants } from './utils/getComponentDescendants'

export type DeleteComponentParams = {
  componentId: string
}

export const deleteComponent = (
  subProject: SubProjectSchema,
  { componentId }: DeleteComponentParams,
): SubProjectSchema => {
  const component = subProject.components[componentId]

  if (!isDefined(component) || component.type === 'root-panel') {
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
