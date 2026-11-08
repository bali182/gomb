import type { BaseSubProjectOperationParamsSchema, DeleteConstraintParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export const deleteConstraint = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeleteConstraintParamsSchema,
): SubProjectSchema => {
  if (!isDefined(accessors.subProject(subProject).optional.constraint.byId(id))) {
    return subProject
  }
  const constraints = { ...subProject.constraints }
  delete constraints[id]
  return { ...subProject, constraints }
}
