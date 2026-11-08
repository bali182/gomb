import type { AddConstraintParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export const addConstraint = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { type }: AddConstraintParamsSchema,
): SubProjectSchema => {
  const constraint = readonlyFactory.createConstraint({ type, forbiddenIds: getSubProjectIds(subProject) })
  return { ...subProject, constraints: { ...subProject.constraints, [constraint.id]: constraint } }
}
