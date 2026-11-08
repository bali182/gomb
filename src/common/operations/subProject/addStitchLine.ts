import type { StitchLineSideOrCornerField } from '../../logic/stitching/stitchLineSidesAndCorners'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { AddStitchLineParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
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

export const addStitchLine = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  params: AddStitchLineParamsSchema,
): SubProjectSchema => {
  const forbiddenIds = getSubProjectIds(subProject)
  const forbiddenNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  let stitchLine: StitchLineSchema
  switch (params.targetType) {
    case 'hole':
      stitchLine = readonlyFactory.createComponentBoundsStitchLine({
        targetId: params.targetId,
        targetType: 'hole',
        forbiddenIds,
        forbiddenNames,
      })
      break
    case 'component':
      stitchLine = readonlyFactory.createStitchLine({
        type: params.type,
        targetId: params.targetId,
        targetType: 'component',
        forbiddenIds,
        forbiddenNames,
      })
      break
  }
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
