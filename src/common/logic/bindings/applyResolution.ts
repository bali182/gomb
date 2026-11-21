import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import type { BindingFieldSchema, BindingSchema, BindingValueSchema } from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { ChangeSchema, SubProjectDiffSchema } from '../../schemas/subProjectDiff'
import { accessors } from '../../utils/accessors'
import { has } from '../../utils/has'
import { isDefined } from '../../utils/isDefined'
import { getBindingFieldValue, setBindingFieldValue } from './bindingFieldValues'

type ApplyResolutionParams = {
  input: SubProjectSchema
  target: SubProjectSchema
  inputDiff: SubProjectDiffSchema
  patchDiff?: SubProjectDiffSchema
}

export const applyResolution = ({ input, target, inputDiff, patchDiff }: ApplyResolutionParams): SubProjectSchema => {
  const bindings = Object.values(target.bindings)
  if (bindings.length === 0) {
    return target
  }
  const inputAccessor = accessors.subProject(input)
  const accessor = accessors.subProject(target)
  let result = target
  for (const binding of bindings) {
    const fields = binding.fields.filter((field) => {
      const model = accessor.optional.binding.model(field)
      return isDefined(model) && has(bindingFieldCompatibility[model.type], field.field)
    })
    // 0 or 1 field in the binding. Since it has nothing to bind to, it doesn't do anything.
    if (fields.length < 2) {
      continue
    }
    const first = fields[0]
    // Without an edit, a new binding or a patcher change, use the first surviving field's current value.
    const fallback = getBindingFieldValue(accessor.binding.model(first), first)
    const inputValues = getChangedValues(fields, inputDiff)
    let value = fallback

    // Something changed in the input (not by the patcher), this will be the value of the other bound values.
    if (inputValues.length > 0) {
      const inputModel = inputAccessor.optional.binding.model(first)
      const inputFallback = isDefined(inputModel) ? getBindingFieldValue(inputModel, first) : fallback
      value = selectChangedValue(inputValues, inputFallback)
    }
    // No linked field value changed in the input: check for a new binding, then for patcher changes.
    else {
      const existingField = getExistingField(fields, inputDiff.bindings[binding.id])
      const existingModel = isDefined(existingField) ? inputAccessor.optional.binding.model(existingField) : undefined
      // A newly linked field adopts the value of a field that already belonged to this binding.
      if (isDefined(existingField) && isDefined(existingModel)) {
        value = getBindingFieldValue(existingModel, existingField)
      } else if (isDefined(patchDiff)) {
        // No input edit or existing binding supplied a value; propagate any linked field change made by a patcher.
        const patchValues = getChangedValues(fields, patchDiff)
        if (patchValues.length > 0) {
          value = selectChangedValue(patchValues, fallback)
        }
      }
    }
    // Do not propagate a reference to a model that no longer exists in the target subproject.
    if (!isValidReference(target, first, value)) {
      value = fallback
    }
    // Write the selected common value to every surviving field in this binding.
    for (const bindingField of fields) {
      result = setBindingFieldValue(result, bindingField, value)
    }
  }
  return result
}

const isSameField = (first: BindingFieldSchema, second: BindingFieldSchema): boolean => {
  return first.modelId === second.modelId && first.field === second.field
}

const getBindingModelChange = (
  diff: SubProjectDiffSchema,
  field: BindingFieldSchema,
): ChangeSchema<ModelObjectSchema> | undefined => {
  switch (field.type) {
    case 'root-panel-binding-field':
    case 'guide-binding-field':
    case 'panel-binding-field':
    case 'pocket-cluster-binding-field':
    case 'front-pocket-binding-field':
    case 't-pocket-binding-field':
      return diff.components[field.modelId]
    case 'hole-binding-field':
      return diff.holes[field.modelId]
    case 'component-bounds-stitch-line-binding-field':
    case 't-pocket-stitch-line-binding-field':
      return diff.stitchLines[field.modelId]
    case 'recessed-binding-field':
    case 'slanted-binding-field':
    case 'optical-illusion-binding-field':
      return diff.pocketOpenings[field.modelId]
  }
}

const getChangedValues = (fields: readonly BindingFieldSchema[], diff: SubProjectDiffSchema): BindingValueSchema[] => {
  const values: BindingValueSchema[] = []
  for (const bindingField of fields) {
    const change = getBindingModelChange(diff, bindingField)
    if (!isDefined(change?.before) || !isDefined(change.after) || change.before.type !== change.after.type) {
      continue
    }
    const previousValue = getBindingFieldValue(change.before, bindingField)
    const value = getBindingFieldValue(change.after, bindingField)
    if (!Object.is(previousValue, value)) {
      values.push(value)
    }
  }
  return values
}

const getExistingField = (
  fields: readonly BindingFieldSchema[],
  change: ChangeSchema<BindingSchema> | undefined,
): BindingFieldSchema | undefined => {
  if (!isDefined(change?.before) || !isDefined(change.after)) {
    return undefined
  }
  const previousFields = change.before.fields
  const hasAddition = change.after.fields.some(
    (bindingField) =>
      fields.some((candidate) => isSameField(candidate, bindingField)) &&
      !previousFields.some((candidate) => isSameField(candidate, bindingField)),
  )
  if (hasAddition) {
    return previousFields.find((bindingField) => fields.some((candidate) => isSameField(candidate, bindingField)))
  }
  return undefined
}

const selectChangedValue = (
  values: readonly BindingValueSchema[],
  fallback: BindingValueSchema,
): BindingValueSchema => {
  const first = values[0]
  return values.every((value) => Object.is(value, first)) ? first : fallback
}

const isValidReference = (
  subProject: SubProjectSchema,
  bindingField: BindingFieldSchema,
  value: BindingValueSchema,
): boolean => {
  const accessor = accessors.subProject(subProject)
  const model = accessor.binding.model(bindingField)
  const group = bindingFieldCompatibility[model.type][bindingField.field]
  if (group === 'reference:pocket-opening') {
    return typeof value === 'string' && isDefined(accessor.optional.pocketOpening.byId(value))
  }
  return true
}
