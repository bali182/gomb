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
  computedHoles: readonly ComputedHoleSchema[],
): Record<string, ComputedStitchLineSchema[]> => {
  const computedStitchLines: ComputedStitchLineSchema[] = []
  const accessor = accessors.subProject(subProject)

  for (const stitchLine of stitchLines) {
    if (stitchLine.targetType === 'hole') {
      const hole = accessor.optional.hole(stitchLine.targetId)
      const computedHole = computedHoles.find((candidate) => candidate.holeId === stitchLine.targetId)

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
      computedStitchLines.push(computedStitchLine)

      continue
    }

    const computedStitchLine = calculateStitchLine(stitchLine, subProject, computedComponents)
    if (isDefined(computedStitchLine)) {
      computedStitchLines.push(computedStitchLine)
    }
  }

  return groupByTarget(computedStitchLines)
}

const groupByTarget = (computedStitchLines: ComputedStitchLineSchema[]): Record<string, ComputedStitchLineSchema[]> => {
  const stitchLinesByComponentId: Record<string, ComputedStitchLineSchema[]> = {}

  for (const computedStitchLine of computedStitchLines) {
    const componentId = computedStitchLine.onTop
    const stitchLines = stitchLinesByComponentId[componentId]

    if (isDefined(stitchLines)) {
      stitchLines.push(computedStitchLine)
    } else {
      stitchLinesByComponentId[componentId] = [computedStitchLine]
    }
  }

  return stitchLinesByComponentId
}
