import type { BaseOperationParamsSchema, SetDefaultPocketOpeningParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export const setDefaultPocketOpening = (
  { subProject }: BaseOperationParamsSchema,
  { id }: SetDefaultPocketOpeningParamsSchema,
): SubProjectSchema => {
  if (
    subProject.defaultPocketOpening === id ||
    !isDefined(accessors.subProject(subProject).optional.pocketOpening.byId(id))
  ) {
    return subProject
  }
  return { ...subProject, defaultPocketOpening: id }
}
