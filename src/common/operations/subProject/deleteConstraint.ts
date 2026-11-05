import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type DeleteConstraintParams = {
  constraintId: string
}

export const deleteConstraint = (
  subProject: SubProjectSchema,
  { constraintId }: DeleteConstraintParams,
): SubProjectSchema => {
  if (!isDefined(accessors.subProject(subProject).optional.constraint.byId(constraintId))) {
    return subProject
  }
  const constraints = { ...subProject.constraints }
  delete constraints[constraintId]
  return { ...subProject, constraints }
}
