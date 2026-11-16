import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import type { BindingFieldBlockReasonSchema, BindingFieldNameSchema } from '../../schemas/bindings'
import type { BindingFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { bindingFieldBlockers } from './bindingFieldBlockers'
import { getBindingFieldInputs } from './getBindingFieldInputs'

export type BindingPropertyBlocker = {
  model: ModelObjectSchema
  alreadyBound: boolean
  autoReason: BindingFieldBlockReasonSchema | undefined
}

export type CommonBindingProperty = {
  field: BindingFieldNameSchema
  fields: BindingFieldInputSchema[]
  blockers: BindingPropertyBlocker[]
}

export const getCommonBindingProperties = (
  subProject: SubProjectSchema,
  models: ModelObjectSchema[],
): CommonBindingProperty[] => {
  const first = models[0]
  if (!isDefined(first)) {
    return []
  }
  const accessor = accessors.subProject(subProject)
  const available = models.map(getBindingFieldInputs)
  return getBindingFieldInputs(first).flatMap((field): CommonBindingProperty[] => {
    const group = bindingFieldCompatibility[first.type][field.field]
    if (!isDefined(group)) {
      return []
    }
    const fields: BindingFieldInputSchema[] = []
    const blockers: BindingPropertyBlocker[] = []
    for (const [index, model] of models.entries()) {
      const input = available[index].find((candidate) => candidate.field === field.field)
      if (!isDefined(input) || bindingFieldCompatibility[model.type][field.field] !== group) {
        return []
      }
      fields.push(input)
      const alreadyBound = accessor.binding.byField(model.id, field.field).length > 0
      const autoReason = bindingFieldBlockers[model.type][field.field]?.(model)
      if (alreadyBound || isDefined(autoReason)) {
        blockers.push({ model, alreadyBound, autoReason })
      }
    }
    return [{ field: field.field, fields, blockers }]
  })
}

export const getValidBindingPropertySelection = (
  properties: CommonBindingProperty[],
  selection: BindingFieldNameSchema[],
): BindingFieldNameSchema[] =>
  selection.filter((field) => properties.some((property) => property.field === field && property.blockers.length === 0))
