import type { AddBindingsParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { addBindingFields } from './addBindingFields'

export const addBindings = (
  base: BaseSubProjectOperationParamsSchema,
  { bindings }: AddBindingsParamsSchema,
): SubProjectSchema => {
  let result = base.subProject
  for (const input of bindings) {
    if (input.fields.length < 2) {
      return base.subProject
    }
    const binding = base.readonlyFactory.createBinding({
      type: input.type,
      forbiddenIds: getSubProjectIds(result),
    })
    const extended: SubProjectSchema = {
      ...result,
      bindings: { ...result.bindings, [binding.id]: binding },
    }
    const updated = addBindingFields({ ...base, subProject: extended }, { bindingId: binding.id, fields: input.fields })
    if (updated.bindings[binding.id].fields.length !== input.fields.length) {
      return base.subProject
    }
    result = updated
  }
  return result
}
