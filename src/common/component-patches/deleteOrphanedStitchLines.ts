import type { StitchLineSchema } from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedStitchLines = (
  subProject: SubProjectSchema,
  _computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const stitchLines: StitchLineSchema[] = []
  let hasChanged = false

  for (const stitchLine of subProject.stitchLines) {
    const hasTarget =
      stitchLine.targetType === 'hole'
        ? isDefined(accessor.optional.hole.byId(stitchLine.targetId))
        : isDefined(accessor.optional.component.byId(stitchLine.targetId))

    // The target of the stitchline has been removed
    if (!hasTarget) {
      hasChanged = true
      continue
    }

    // All good.
    stitchLines.push(stitchLine)
  }

  if (!hasChanged) {
    return subProject
  }

  return {
    ...subProject,
    stitchLines,
  }
}
