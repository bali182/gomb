import type { HasComponentTargetSchema, HasHoleTargetSchema } from '../../schemas/common'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { canAddStitchLine } from './utils/componentRules'

export type MoveStitchLineToComponentParams = HasComponentTargetSchema & {
  stitchLineId: string
}

export type MoveStitchLineToHoleParams = HasHoleTargetSchema & {
  stitchLineId: string
}

export type MoveStitchLineParams = MoveStitchLineToHoleParams | MoveStitchLineToComponentParams

export const moveStitchLine = (subProject: SubProjectSchema, params: MoveStitchLineParams): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const stitchLine = accessor.optional.stitchLine.byId(params.stitchLineId)

  if (!isDefined(stitchLine)) {
    return subProject
  }

  switch (params.targetType) {
    case 'hole': {
      const targetHole = accessor.optional.hole.byId(params.targetId)
      if (!narrowers.is.componentBoundsStitchLine(stitchLine) || !isDefined(targetHole)) {
        return subProject
      }
      return updateStitchLine(subProject, { ...stitchLine, targetType: params.targetType, targetId: params.targetId })
    }
    case 'component': {
      const targetComponent = accessor.optional.component.byId(params.targetId)
      if (!isDefined(targetComponent)) {
        return subProject
      }
      if (!canAddStitchLine(targetComponent, subProject, stitchLine.type)) {
        return subProject
      }
      return updateStitchLine(subProject, { ...stitchLine, targetType: params.targetType, targetId: params.targetId })
    }
  }
}

const updateStitchLine = (subProject: SubProjectSchema, stitchLine: StitchLineSchema): SubProjectSchema => {
  return {
    ...subProject,
    stitchLines: subProject.stitchLines.map((candidate) => (candidate.id === stitchLine.id ? stitchLine : candidate)),
  }
}
