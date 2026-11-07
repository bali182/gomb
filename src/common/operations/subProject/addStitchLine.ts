import type { StitchLineSideOrCornerField } from '../../logic/stitching/stitchLineSidesAndCorners'
import type { HasTargetSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import { StitchLineSchema } from '../../schemas/stitching'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

const POCKET_OPENING_STITCH_FIELDS: Record<PocketOrientationSchema, readonly StitchLineSideOrCornerField[]> = {
  up: ['top', 'topLeftCorner', 'topRightCorner'],
  right: ['right', 'topRightCorner', 'bottomRightCorner'],
  down: ['bottom', 'bottomLeftCorner', 'bottomRightCorner'],
  left: ['left', 'topLeftCorner', 'bottomLeftCorner'],
}

export type AddStitchLineParams = HasTargetSchema & {
  type: StitchLineSchema['type']
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const addStitchLine = (subProject: SubProjectSchema, params: AddStitchLineParams): SubProjectSchema => {
  const stitchLine = params.modelFactory.createStitchLine({
    type: params.type,
    targetId: params.targetId,
    targetType: params.targetType,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name)),
  })
  if (stitchLine.targetType === 'component' && narrowers.is.componentBoundsStitchLine(stitchLine)) {
    const accessor = accessors.subProject(subProject)
    const target = accessor.optional.component.byId(stitchLine.targetId)
    const targetParent = isDefined(target) ? accessor.optional.component.parent(target.id) : undefined
    const referenceCluster = [target, targetParent].filter(isDefined).find(narrowers.is.pocketCluster)
    if (isDefined(referenceCluster)) {
      for (const field of POCKET_OPENING_STITCH_FIELDS[referenceCluster.orientation]) {
        stitchLine[field] = false
      }
    }
  }
  return {
    ...subProject,
    stitchLines: [...subProject.stitchLines, stitchLine],
  }
}
