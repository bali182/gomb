import type { HoleSchema } from '../../schemas/hole'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type AddHoleParams = {
  hole: HoleSchema
}

export const addHole = (subProject: SubProjectSchema, params: AddHoleParams): SubProjectSchema => {
  const cluster = accessors.subProject(subProject).optional.component.pocketCluster(params.hole.componentId)
  if (isDefined(cluster)) {
    return subProject
  }
  return {
    ...subProject,
    holes: [...subProject.holes, params.hole],
  }
}
