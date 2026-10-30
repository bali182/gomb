import type { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculateStitchLine } from './calculateStitchLine'

export const calculateStitchLines = (
  stitchLines: ResolvedStitchLineSchema[],
  subProject: SubProjectSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
  computedHoles: Record<string, ComputedHoleSchema>,
): Record<string, ComputedStitchLineSchema> => {
  const computedStitchLines: Record<string, ComputedStitchLineSchema> = {}
  const accessor = accessors.subProject(subProject)

  for (const stitchLine of stitchLines) {
    if (stitchLine.targetType === 'hole') {
      const hole = accessor.optional.hole.byId(stitchLine.targetId)
      const computedHole = computedHoles[stitchLine.targetId]

      if (!isDefined(hole) || !isDefined(computedHole)) {
        continue
      }

      const computedStitchLine = calculateComponentBoundsStitchLine(
        stitchLine,
        {
          componentId: computedHole.componentId,
          boundingRect: computedHole.boundingRect,
          cornerRadius: computedHole.cornerRadius,
        },
        computedComponents,
      )
      computedStitchLines[computedStitchLine.stitchLineId] = computedStitchLine

      continue
    }

    const computedStitchLine = calculateStitchLine(stitchLine, subProject, computedComponents)
    if (isDefined(computedStitchLine)) {
      computedStitchLines[computedStitchLine.stitchLineId] = computedStitchLine
    }
  }

  return computedStitchLines
}
