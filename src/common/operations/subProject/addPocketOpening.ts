import type { AddPocketOpeningParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export const addPocketOpening = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { type }: AddPocketOpeningParamsSchema,
): SubProjectSchema => {
  const opening = readonlyFactory.createPocketOpening({
    type,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: accessors.subProject(subProject).pocketOpening.names(),
  })
  return { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, [opening.id]: opening } }
}
