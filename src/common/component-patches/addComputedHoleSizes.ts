import type { HoleSchema } from '../schemas/hole'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const addComputedHoleSizes = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.computedSubProject(computedSubProject)
  let modified = false
  const holes: HoleSchema[] = []
  for (const hole of subProject.holes) {
    const computed = accessor.optional.hole.byId(hole.id)
    if (!isDefined(computed)) {
      holes.push(hole)
      continue
    }
    const width = hole.autoWidth ? computed.layoutBoundingRect.width.toNumber() : hole.width
    const height = hole.autoHeight ? computed.layoutBoundingRect.height.toNumber() : hole.height
    if (width === hole.width && height === hole.height) {
      holes.push(hole)
      continue
    }
    modified = true
    holes.push({ ...hole, width, height })
  }
  return modified ? { ...subProject, holes } : subProject
}
