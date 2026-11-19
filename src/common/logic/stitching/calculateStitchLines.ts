import type {
  ComputedComponentSchema,
  ComputedHoleSchema,
  ComputedStitchLineSchema,
  ComputedStitchRouteSchema,
} from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculateStitchLine } from './calculateStitchLine'
import type { StitchLineGeometry } from './helperTypes'
import { normalizeStitchLineEntryAndExit } from './stitchLineComponentValidation'

export const calculateStitchLines = (
  stitchLines: ResolvedStitchLineSchema[],
  subProject: SubProjectSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
  computedHoles: Record<string, ComputedHoleSchema>,
): Record<string, ComputedStitchLineSchema> => {
  const computedStitchLines: Record<string, ComputedStitchLineSchema> = {}
  const accessor = accessors.subProject(subProject)

  for (const stitchLine of stitchLines) {
    let calculated: StitchLineGeometry | undefined
    if (stitchLine.targetType === 'hole') {
      const hole = accessor.optional.hole.byId(stitchLine.targetId)
      const computedHole = computedHoles[stitchLine.targetId]

      if (!isDefined(hole) || !isDefined(computedHole)) {
        continue
      }

      calculated = calculateComponentBoundsStitchLine(stitchLine, {
        componentId: computedHole.componentId,
        boundingRect: computedHole.boundingRect,
        cornerRadius: computedHole.cornerRadius,
      })
    } else {
      calculated = calculateStitchLine(stitchLine, accessor, computedComponents)
    }
    if (!isDefined(calculated)) {
      continue
    }
    const face = accessor.optional.component.rootPanelFaceOf(calculated.componentId)
    if (!isDefined(face)) {
      continue
    }
    const routes = calculated.routes.flatMap((geometry): ComputedStitchRouteSchema[] => {
      const pocketId = stitchLine.type === 't-pocket-stitch-line' ? geometry.targetId : undefined
      const validation = normalizeStitchLineEntryAndExit(stitchLine.id, accessor, pocketId)
      if (!isDefined(validation)) {
        return []
      }
      const route: ComputedStitchRouteSchema = {
        ...geometry,
        stitchLineId: stitchLine.id,
        faceId: face.id,
        entryComponentId: validation.entryComponent.id,
        exitComponentId: validation.exitComponent.id,
      }
      return [route]
    })
    computedStitchLines[stitchLine.id] = { ...calculated, routes }
  }

  return computedStitchLines
}
