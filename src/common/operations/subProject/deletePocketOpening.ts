import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { updateComponents } from '../../utils/updateComponents'

export type DeletePocketOpeningParams = { openingId: string }

export const deletePocketOpening = (
  subProject: SubProjectSchema,
  { openingId }: DeletePocketOpeningParams,
): SubProjectSchema => {
  if (
    openingId === subProject.defaultPocketOpening ||
    !isDefined(accessors.subProject(subProject).optional.pocketOpening.byId(openingId))
  ) {
    return subProject
  }
  const pocketOpenings = { ...subProject.pocketOpenings }
  delete pocketOpenings[openingId]
  const updatedSubProject = updateComponents({
    subProject,
    mapper: (_id, component) =>
      narrowers.is.pocket(component) && component.openingId === openingId
        ? { ...component, openingId: subProject.defaultPocketOpening }
        : component,
  })
  return { ...updatedSubProject, pocketOpenings }
}
