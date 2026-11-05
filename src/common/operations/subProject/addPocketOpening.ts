import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export type AddPocketOpeningParams = {
  type: PocketOpeningSchema['type']
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const addPocketOpening = (
  subProject: SubProjectSchema,
  { type, modelFactory }: AddPocketOpeningParams,
): SubProjectSchema => {
  const opening = modelFactory.createPocketOpening({
    type,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(Object.values(subProject.pocketOpenings).map((opening) => opening.name)),
  })
  return { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, [opening.id]: opening } }
}
