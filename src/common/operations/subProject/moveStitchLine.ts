import type { HasComponentTargetSchema, HasHoleTargetSchema } from '../../schemas/common'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { canAddStitchLine } from './utils/componentRules'

export type MoveStitchLineToComponentParams = HasComponentTargetSchema & {
  stitchLineId: string
}

export type MoveStitchLineToHoleParams = HasHoleTargetSchema & {
  stitchLineId: string
}

export type MoveStitchLineParams = MoveStitchLineToHoleParams | MoveStitchLineToComponentParams

export const moveStitchLine = (subProject: SubProjectSchema, params: MoveStitchLineParams): SubProjectSchema => {
  const stitchLine = subProject.stitchLines.find((candidate) => candidate.id === params.stitchLineId)

  if (!isDefined(stitchLine)) {
    return subProject
  }

  switch (params.targetType) {
    case 'hole': {
      const targetHole = subProject.holes.find((candidate) => candidate.id === params.targetId)
      if (stitchLine.type !== 'component-bounds-stitch-line' || !isDefined(targetHole)) {
        return subProject
      }
      return updateStitchLine(subProject, { ...stitchLine, targetType: params.targetType, targetId: params.targetId })
    }
    case 'component': {
      const targetComponent = subProject.components[params.targetId]
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
