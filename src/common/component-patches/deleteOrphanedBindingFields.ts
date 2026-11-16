import { bindingFieldCompatibility } from '../data/bindingFieldCompatibility'
import type { BindingSchema } from '../schemas/bindings'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { has } from '../utils/has'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedBindingFields = (
  subProject: SubProjectSchema,
  _computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const bindings: Record<string, BindingSchema> = {}
  let hasChanged = false

  for (const [id, binding] of Object.entries(subProject.bindings)) {
    const fields = binding.fields.filter((field) => {
      const model = accessor.optional.binding.model(field)
      return isDefined(model) && has(bindingFieldCompatibility[model.type], field.field)
    })
    if (fields.length !== binding.fields.length) {
      bindings[id] = { ...binding, fields }
      hasChanged = true
    } else {
      bindings[id] = binding
    }
  }

  return hasChanged ? { ...subProject, bindings } : subProject
}
