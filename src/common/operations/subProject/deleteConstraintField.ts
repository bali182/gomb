import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type DeleteConstraintFieldParams = {
  constraintId: string
  fieldId: string
}

export const deleteConstraintField = (
  subProject: SubProjectSchema,
  { constraintId, fieldId }: DeleteConstraintFieldParams,
): SubProjectSchema => {
  const constraint = accessors.subProject(subProject).optional.constraint.byId(constraintId)
  if (!isDefined(constraint) || !constraint.fields.some((field) => field.id === fieldId)) {
    return subProject
  }
  return {
    ...subProject,
    constraints: {
      ...subProject.constraints,
      [constraintId]: { ...constraint, fields: constraint.fields.filter((field) => field.id !== fieldId) },
    },
  }
}
