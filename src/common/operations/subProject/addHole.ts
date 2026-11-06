import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export type AddHoleParams = {
  componentId: string
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const addHole = (subProject: SubProjectSchema, params: AddHoleParams): SubProjectSchema => {
  const cluster = accessors.subProject(subProject).optional.component.pocketCluster(params.componentId)
  if (isDefined(cluster)) {
    return subProject
  }
  const hole = params.modelFactory.createHole({
    componentId: params.componentId,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(subProject.holes.map((hole) => hole.name)),
  })
  return {
    ...subProject,
    holes: [...subProject.holes, hole],
  }
}
