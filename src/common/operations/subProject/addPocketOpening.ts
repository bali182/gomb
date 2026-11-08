import type { AddPocketOpeningParamsSchema, BaseOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export const addPocketOpening = (
  { subProject, readonlyFactory }: BaseOperationParamsSchema,
  { type }: AddPocketOpeningParamsSchema,
): SubProjectSchema => {
  const opening = readonlyFactory.createPocketOpening({
    type,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(Object.values(subProject.pocketOpenings).map((opening) => opening.name)),
  })
  return { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, [opening.id]: opening } }
}
