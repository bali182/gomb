import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedHoles = (
  subProject: SubProjectSchema,
  _computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const holes = subProject.holes.filter((hole) => isDefined(accessor.optional.component.byId(hole.componentId)))

  if (holes.length === subProject.holes.length) {
    return subProject
  }

  return {
    ...subProject,
    holes,
  }
}
