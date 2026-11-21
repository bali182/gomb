import { AddComponentParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getInsertionIndex } from './utils/getInsertionIndex'

export const addComponent = (
  { subProject, project, settings, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { parentId, position, type, color }: AddComponentParamsSchema,
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
  const component = readonlyFactory.createComponent({
    type,
    color: color ?? (settings.edit.addBaseColor ? project.colorSettings.leatherColor : undefined),
    stitchingSettings: project.stitchingSettings,
    openingId: subProject.defaultPocketOpening,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: accessors.subProject(subProject).component.names(),
  })
  return {
    ...subProject,
    components: {
      ...subProject.components,
      [parent.id]: {
        ...parent,
        children: [...parent.children.slice(0, insertionIndex), component.id, ...parent.children.slice(insertionIndex)],
      },
      [component.id]: component,
    },
  }
}
