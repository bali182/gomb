import type { BaseOperationParamsSchema, ClonePocketOpeningParamsSchema } from '../../schemas/operations'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export const clonePocketOpening = (
  { subProject, id: idGenerator, name: nameGenerator }: BaseOperationParamsSchema,
  { id: openingId }: ClonePocketOpeningParamsSchema,
): SubProjectSchema => {
  const source = accessors.subProject(subProject).optional.pocketOpening.byId(openingId)
  if (!isDefined(source)) {
    return subProject
  }
  const idMappings = getCloneIdMappings(subProject, idGenerator)
  const usedNames = new Set(Object.values(subProject.pocketOpenings).map((opening) => opening.name))
  const cloned: PocketOpeningSchema = {
    ...source,
    id: idMappings[source.id],
    name: nameGenerator.getByBaseName(source.name, usedNames),
  }
  return {
    ...subProject,
    pocketOpenings: {
      ...subProject.pocketOpenings,
      [cloned.id]: cloned,
    },
  }
}
