import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import { bindingFieldBlockers } from '../../logic/bindings/bindingFieldBlockers'
import type { BindingFieldSchema } from '../../schemas/bindings'
import type { AddBindingFieldsParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const addBindingFields = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { bindingId, fields: inputs }: AddBindingFieldsParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const binding = accessor.optional.binding.byId(bindingId)
  if (!isDefined(binding)) {
    return subProject
  }
  const forbiddenIds = getSubProjectIds(subProject)
  const fields: BindingFieldSchema[] = [...binding.fields]
  for (const input of inputs) {
    const field = readonlyFactory.createBindingField({ ...input, forbiddenIds })
    const model = accessor.optional.binding.model(field)
    if (!isDefined(model)) {
      continue
    }
    const group = bindingFieldCompatibility[model.type][field.field]
    const blocked = bindingFieldBlockers[model.type][field.field]?.(model)
    if (
      !isDefined(group) ||
      isDefined(blocked) ||
      accessor.binding.byField(field.modelId, field.field).length > 0 ||
      fields.some((member) => member.modelId === field.modelId && member.field === field.field)
    ) {
      continue
    }
    const compatible = fields.every((member) => {
      const memberModel = accessor.optional.binding.model(member)
      return isDefined(memberModel) && bindingFieldCompatibility[memberModel.type][member.field] === group
    })
    if (compatible) {
      fields.push(field)
      forbiddenIds.add(field.id)
    }
  }
  if (fields.length === binding.fields.length) {
    return subProject
  }
  return {
    ...subProject,
    bindings: {
      ...subProject.bindings,
      [bindingId]: { ...binding, fields },
    },
  }
}
