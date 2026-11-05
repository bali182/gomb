import type { HasTargetSchema } from '../../schemas/common'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import { StitchLineSchema } from '../../schemas/stitching'
import { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

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
  return {
    ...subProject,
    stitchLines: [...subProject.stitchLines, stitchLine],
  }
}
