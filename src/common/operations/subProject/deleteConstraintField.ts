import type { BaseOperationParamsSchema, DeleteConstraintFieldParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export const deleteConstraintField = (
  { subProject }: BaseOperationParamsSchema,
  { constraintId, id }: DeleteConstraintFieldParamsSchema,
): SubProjectSchema => {
  const constraint = accessors.subProject(subProject).optional.constraint.byId(constraintId)
  if (!isDefined(constraint) || !constraint.fields.some((field) => field.id === id)) {
    return subProject
  }
  return {
    ...subProject,
    constraints: {
      ...subProject.constraints,
      [constraintId]: {
        ...constraint,
        fields: constraint.fields.filter((field) => field.id !== id),
      },
    },
  }
}
