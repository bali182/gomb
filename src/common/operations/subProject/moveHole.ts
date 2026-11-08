import { HoleSchema } from '../../schemas/hole'
import type { BaseSubProjectOperationParamsSchema, MoveHoleParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { canAddHole } from './utils/componentRules'

export const moveHole = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id, targetComponentId }: MoveHoleParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const hole = accessor.optional.hole.byId(id)
  const target = accessor.optional.component.byId(targetComponentId)

  if (!isDefined(hole) || !isDefined(target) || hole.componentId === targetComponentId) {
    return subProject
  }

  if (!canAddHole(target)) {
    return subProject
  }
  const newHole: HoleSchema = { ...hole, componentId: targetComponentId }

  return {
    ...subProject,
    holes: subProject.holes.map((candidate) => (candidate.id === id ? newHole : candidate)),
  }
}
