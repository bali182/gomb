import type { AddHoleParamsSchema, BaseOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const addHole = (
  { subProject, readonlyFactory }: BaseOperationParamsSchema,
  params: AddHoleParamsSchema,
): SubProjectSchema => {
  const cluster = accessors.subProject(subProject).optional.component.pocketCluster(params.targetId)
  if (isDefined(cluster)) {
    return subProject
  }
  const hole = readonlyFactory.createHole({
    componentId: params.targetId,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(subProject.holes.map((hole) => hole.name)),
  })
  return {
    ...subProject,
    holes: [...subProject.holes, hole],
  }
}
