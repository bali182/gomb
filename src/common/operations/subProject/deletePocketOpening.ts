import type { BaseSubProjectOperationParamsSchema, DeletePocketOpeningParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { updateComponents } from '../../utils/updateComponents'

export const deletePocketOpening = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeletePocketOpeningParamsSchema,
): SubProjectSchema => {
  if (
    id === subProject.defaultPocketOpening ||
    !isDefined(accessors.subProject(subProject).optional.pocketOpening.byId(id))
  ) {
    return subProject
  }
  const pocketOpenings = { ...subProject.pocketOpenings }
  delete pocketOpenings[id]
  const updatedSubProject = updateComponents({
    subProject,
    mapper: (_id, component) =>
      narrowers.is.pocket(component) && component.openingId === id
        ? { ...component, openingId: subProject.defaultPocketOpening }
        : component,
  })
  return { ...updatedSubProject, pocketOpenings }
}
