import type { AttachPocketOpeningParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { updateComponents } from '../../utils/updateComponents'

export const attachPocketOpening = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { openingId, componentId }: AttachPocketOpeningParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const targetComponent = accessor.optional.component.byId(componentId)
  if (!isDefined(targetComponent) || !isDefined(accessor.optional.pocketOpening.byId(openingId))) {
    return subProject
  }
  if (narrowers.is.pocket(targetComponent)) {
    return updateComponents({
      subProject,
      mapper: (id, component) =>
        id === componentId && narrowers.is.pocket(component) && component.openingId !== openingId
          ? { ...component, openingId }
          : component,
    })
  }
  const componentIds = new Set(accessor.component.descendantIds(componentId, true))
  return updateComponents({
    subProject,
    mapper: (id, component) =>
      componentIds.has(id) && narrowers.is.pocket(component) && component.openingId !== openingId
        ? { ...component, openingId }
        : component,
  })
}
