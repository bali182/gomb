import type {
  BaseSubProjectOperationParamsSchema,
  DeleteModelConstraintFieldsParamsSchema,
} from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'

export const deleteModelConstraintFields = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { modelId }: DeleteModelConstraintFieldsParamsSchema,
): SubProjectSchema => {
  const affectedConstraints = accessors.subProject(subProject).constraint.byModel(modelId)
  if (affectedConstraints.length === 0) {
    return subProject
  }

  const constraints = { ...subProject.constraints }
  for (const constraint of affectedConstraints) {
    const fields = constraint.fields.filter((field) => field.modelId !== modelId)
    if (fields.length === 0) {
      delete constraints[constraint.id]
    } else {
      constraints[constraint.id] = { ...constraint, fields }
    }
  }

  return { ...subProject, constraints }
}
