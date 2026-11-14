import type { AddConstraintsParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { addConstraintFields } from './addConstraintFields'

export const addConstraints = (
  base: BaseSubProjectOperationParamsSchema,
  { constraints }: AddConstraintsParamsSchema,
): SubProjectSchema => {
  let result = base.subProject
  for (const input of constraints) {
    if (input.fields.length < 2) {
      return base.subProject
    }
    const constraint = base.readonlyFactory.createConstraint({
      type: input.type,
      forbiddenIds: getSubProjectIds(result),
    })
    const extended: SubProjectSchema = {
      ...result,
      constraints: { ...result.constraints, [constraint.id]: constraint },
    }
    const updated = addConstraintFields(
      { ...base, subProject: extended },
      { constraintId: constraint.id, fields: input.fields },
    )
    if (updated.constraints[constraint.id].fields.length !== input.fields.length) {
      return base.subProject
    }
    result = updated
  }
  return result
}
