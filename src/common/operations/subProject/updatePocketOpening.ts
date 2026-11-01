import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type UpdatePocketOpeningParams = { opening: PocketOpeningSchema }

export const updatePocketOpening = (
  subProject: SubProjectSchema,
  { opening }: UpdatePocketOpeningParams,
): SubProjectSchema => {
  const current = accessors.subProject(subProject).optional.pocketOpening.byId(opening.id)
  if (!isDefined(current) || current.type !== opening.type || current === opening) {
    return subProject
  }
  return { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, [opening.id]: opening } }
}
