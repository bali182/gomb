import type {
  BaseSubProjectOperationParamsSchema,
  DeleteModelBindingFieldsParamsSchema,
} from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'

export const deleteModelBindingFields = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { modelId }: DeleteModelBindingFieldsParamsSchema,
): SubProjectSchema => {
  const affectedBindings = accessors.subProject(subProject).binding.byModel(modelId)
  if (affectedBindings.length === 0) {
    return subProject
  }

  const bindings = { ...subProject.bindings }
  for (const binding of affectedBindings) {
    const fields = binding.fields.filter((field) => field.modelId !== modelId)
    if (fields.length === 0) {
      delete bindings[binding.id]
    } else {
      bindings[binding.id] = { ...binding, fields }
    }
  }

  return { ...subProject, bindings }
}
