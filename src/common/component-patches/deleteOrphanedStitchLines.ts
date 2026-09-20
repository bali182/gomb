import type { StitchLineSchema } from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedStitchLines = (
  subProject: SubProjectSchema,
  _computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const stitchLines: StitchLineSchema[] = []
  let hasChanged = false

  for (const stitchLine of subProject.stitchLines) {
    const hasTarget =
      stitchLine.targetType === 'hole'
        ? subProject.holes.some((hole) => hole.id === stitchLine.targetId)
        : isDefined(subProject.components[stitchLine.targetId])

    // The target of the stitchline has been removed
    if (!hasTarget) {
      hasChanged = true
      continue
    }

    // The "onTop" target has been removed.
    if (
      stitchLine.type === 'component-bounds-stitch-line' &&
      isDefined(stitchLine.onTop) &&
      !isDefined(subProject.components[stitchLine.onTop])
    ) {
      // Reset onTop to undefined -> is drawn on top of targetId.
      stitchLines.push({ ...stitchLine, onTop: undefined })
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
