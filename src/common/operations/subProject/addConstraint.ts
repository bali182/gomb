import type { ConstraintSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type AddConstraintParams = {
  constraint: ConstraintSchema
}

export const addConstraint = (subProject: SubProjectSchema, { constraint }: AddConstraintParams): SubProjectSchema => {
  if (isDefined(accessors.subProject(subProject).optional.constraint.byId(constraint.id))) {
    return subProject
  }
  return { ...subProject, constraints: { ...subProject.constraints, [constraint.id]: constraint } }
}
