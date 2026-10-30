import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
export const deletePocketClusterHoles = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const holes = subProject.holes.filter((hole) => {
    return !isDefined(accessor.optional.component.pocketCluster(hole.componentId))
  })
  return holes.length === subProject.holes.length ? subProject : { ...subProject, holes }
}
