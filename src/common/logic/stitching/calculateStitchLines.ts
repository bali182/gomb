import type { ComponentSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { HoleSchema } from '../../schemas/hole'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculateStitchLine } from './calculateStitchLine'

export const calculateStitchLines = (
  stitchLines: ResolvedStitchLineSchema[],
  components: Record<string, ComponentSchema>,
  computedComponents: Record<string, ComputedComponentSchema>,
  holes: readonly HoleSchema[],
  computedHoles: readonly ComputedHoleSchema[],
): Record<string, ComputedStitchLineSchema[]> => {
  const computedStitchLines: ComputedStitchLineSchema[] = []

  for (const stitchLine of stitchLines) {
    if (stitchLine.targetType === 'hole') {
      const hole = holes.find((candidate) => candidate.id === stitchLine.targetId)
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

    const component = components[stitchLine.targetId]
    const computedComponent = computedComponents[stitchLine.targetId]

    if (!isDefined(component) || !isDefined(computedComponent)) {
      continue
    }
    const computedStitchLine = calculateStitchLine(stitchLine, component, computedComponent, computedComponents)
    computedStitchLines.push(computedStitchLine)
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
