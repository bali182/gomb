import { HoleSchema } from '../../schemas/hole'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { canAddHole } from './utils/componentRules'

export type MoveHoleParams = {
  holeId: string
  targetComponentId: string
}

export const moveHole = (
  subProject: SubProjectSchema,
  { holeId, targetComponentId }: MoveHoleParams,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const hole = accessor.optional.hole(holeId)
  const target = accessor.optional.component(targetComponentId)

  if (!isDefined(hole) || !isDefined(target) || hole.componentId === targetComponentId) {
    return subProject
  }

  if (!canAddHole(target)) {
    return subProject
  }
  const newHole: HoleSchema = { ...hole, componentId: targetComponentId }

  return {
    ...subProject,
    holes: subProject.holes.map((candidate) => (candidate.id === holeId ? newHole : candidate)),
  }
}
