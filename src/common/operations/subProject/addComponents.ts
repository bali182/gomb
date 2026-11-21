import { AddComponentsParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { canAddChild } from './utils/componentRules'
import { getInsertionIndex } from './utils/getInsertionIndex'

export const addComponents = (
  { subProject, factory }: BaseSubProjectOperationParamsSchema,
  { createComponents, parentId, position }: AddComponentsParamsSchema,
): SubProjectSchema => {
  const parent = accessors.subProject(subProject).optional.component.byId(parentId)

  if (!isDefined(parent)) {
    throw new Error('Missing parent')
  }
  if (narrowers.is.rootPanel(parent)) {
    return subProject
  }

  const insertionIndex = getInsertionIndex(position, parent.children.length)
  if (!Number.isInteger(insertionIndex) || insertionIndex < 0 || insertionIndex > parent.children.length) {
    return subProject
  }

  const forbiddenIds = getSubProjectIds(subProject)
  const forbiddenNames = accessors.subProject(subProject).component.names()
  const components = createComponents({ factory, forbiddenIds, forbiddenNames })

  if (
    components.length === 0 ||
    components.some(
      (component) =>
        (narrowers.is.guide(component) || narrowers.is.guide(parent)) &&
        !canAddChild(parent, component.type, subProject),
    )
  ) {
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
