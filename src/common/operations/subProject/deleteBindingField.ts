import type { BaseSubProjectOperationParamsSchema, DeleteBindingFieldParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export const deleteBindingField = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { bindingId, id }: DeleteBindingFieldParamsSchema,
): SubProjectSchema => {
  const binding = accessors.subProject(subProject).optional.binding.byId(bindingId)
  if (!isDefined(binding) || !binding.fields.some((field) => field.id === id)) {
    return subProject
  }
  return {
    ...subProject,
    bindings: {
      ...subProject.bindings,
      [bindingId]: {
        ...binding,
        fields: binding.fields.filter((field) => field.id !== id),
      },
    },
  }
}
