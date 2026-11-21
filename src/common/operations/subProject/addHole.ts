import type { AddHoleParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const addHole = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  params: AddHoleParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const unsupportedOwner =
    accessor.optional.component.pocketCluster(params.targetId) ?? accessor.optional.component.guide(params.targetId)
  if (isDefined(unsupportedOwner)) {
    return subProject
  }
  const hole = readonlyFactory.createHole({
    componentId: params.targetId,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: accessors.subProject(subProject).hole.names(),
  })
  return {
    ...subProject,
    holes: [...subProject.holes, hole],
  }
}
