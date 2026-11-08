import { AddComponentsParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'
import { getInsertionIndex } from './utils/getInsertionIndex'

export const addComponents = (
  { subProject, factory }: BaseSubProjectOperationParamsSchema,
  { createComponents, parentId, position }: AddComponentsParamsSchema,
): SubProjectSchema => {
  const parent = accessors.subProject(subProject).optional.component.byId(parentId)

  if (!isDefined(parent)) {
    throw new Error('Missing parent')
  }

  const insertionIndex = getInsertionIndex(position, parent.children.length)
  if (!Number.isInteger(insertionIndex) || insertionIndex < 0 || insertionIndex > parent.children.length) {
    return subProject
  }

  const forbiddenIds = getSubProjectIds(subProject)
  const forbiddenNames = new Set(Object.values(subProject.components).map((component) => component.name))
  const components = createComponents({ factory, forbiddenIds, forbiddenNames })

  if (components.length === 0) {
    return subProject
  }

  const ids = components.map((component) => component.id)
  const extension = Object.fromEntries(components.map((component) => [component.id, component]))
  return {
    ...subProject,
    components: {
      ...subProject.components,
      ...extension,
      [parent.id]: {
        ...parent,
        children: [...parent.children.slice(0, insertionIndex), ...ids, ...parent.children.slice(insertionIndex)],
      },
    },
  }
}
