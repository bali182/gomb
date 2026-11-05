import type { ConstraintSchema } from '../../schemas/constraints'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export type AddConstraintParams = {
  type: ConstraintSchema['type']
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const addConstraint = (
  subProject: SubProjectSchema,
  { type, modelFactory }: AddConstraintParams,
): SubProjectSchema => {
  const constraint = modelFactory.createConstraint({ type, forbiddenIds: getSubProjectIds(subProject) })
  return { ...subProject, constraints: { ...subProject.constraints, [constraint.id]: constraint } }
}
