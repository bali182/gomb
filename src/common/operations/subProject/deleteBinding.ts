import type { BaseSubProjectOperationParamsSchema, DeleteBindingParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export const deleteBinding = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeleteBindingParamsSchema,
): SubProjectSchema => {
  if (!isDefined(accessors.subProject(subProject).optional.binding.byId(id))) {
    return subProject
  }
  const bindings = { ...subProject.bindings }
  delete bindings[id]
  return { ...subProject, bindings }
}
