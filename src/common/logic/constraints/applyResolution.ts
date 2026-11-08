import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import type { ConstraintFieldSchema, ConstraintSchema, ConstraintValueSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { ChangeSchema, SubProjectDiffSchema } from '../../schemas/subProjectDiff'
import { accessors } from '../../utils/accessors'
import { has } from '../../utils/has'
import { isDefined } from '../../utils/isDefined'
import { getConstraintFieldValue, setConstraintFieldValue } from './constraintFieldValues'

type ApplyResolutionParams = {
  input: SubProjectSchema
  target: SubProjectSchema
  inputDiff: SubProjectDiffSchema
  patchDiff?: SubProjectDiffSchema
}

export const applyResolution = ({ input, target, inputDiff, patchDiff }: ApplyResolutionParams): SubProjectSchema => {
  const constraints = Object.values(target.constraints)
  if (constraints.length === 0) {
    return target
  }
  const inputAccessor = accessors.subProject(input)
  const accessor = accessors.subProject(target)
  let result = target
  for (const constraint of constraints) {
    const fields = constraint.fields.filter((field) => {
      const model = accessor.optional.constraint.model(field)
      return isDefined(model) && has(constraintFieldCompatibility[model.type], field.field)
    })
    // 0 or 1 field in the constraint. Since it has nothing to constrain to, it doesn't do anything.
    if (fields.length < 2) {
      continue
    }
    const first = fields[0]
    // Without an edit, a new binding or a patcher change, use the first surviving field's current value.
    const fallback = getConstraintFieldValue(accessor.constraint.model(first), first)
    const inputValues = getChangedValues(fields, inputDiff)
    let value = fallback

    // Something changed in the input (not by the patcher), this will be the value of the other constrained values.
    if (inputValues.length > 0) {
      const inputModel = inputAccessor.optional.constraint.model(first)
      const inputFallback = isDefined(inputModel) ? getConstraintFieldValue(inputModel, first) : fallback
      value = selectChangedValue(inputValues, inputFallback)
    }
    // No linked field value changed in the input: check for a new binding, then for patcher changes.
    else {
      const existingField = getExistingField(fields, inputDiff.constraints[constraint.id])
      const existingModel = isDefined(existingField)
        ? inputAccessor.optional.constraint.model(existingField)
        : undefined
      // A newly linked field adopts the value of a field that already belonged to this constraint.
      if (isDefined(existingField) && isDefined(existingModel)) {
        value = getConstraintFieldValue(existingModel, existingField)
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
    // Write the selected common value to every surviving field in this constraint.
    for (const constraintField of fields) {
      result = setConstraintFieldValue(result, constraintField, value)
    }
  }
  return result
}

const isSameField = (first: ConstraintFieldSchema, second: ConstraintFieldSchema): boolean => {
  return first.modelId === second.modelId && first.field === second.field
}

const getConstraintModelChange = (
  diff: SubProjectDiffSchema,
  field: ConstraintFieldSchema,
): ChangeSchema<ModelObjectSchema> | undefined => {
  switch (field.type) {
    case 'root-panel-constraint-field':
    case 'panel-constraint-field':
    case 'pocket-cluster-constraint-field':
    case 'front-pocket-constraint-field':
    case 't-pocket-constraint-field':
      return diff.components[field.modelId]
    case 'hole-constraint-field':
      return diff.holes[field.modelId]
    case 'component-bounds-stitch-line-constraint-field':
    case 't-pocket-stitch-line-constraint-field':
      return diff.stitchLines[field.modelId]
    case 'recessed-constraint-field':
    case 'slanted-constraint-field':
    case 'optical-illusion-constraint-field':
      return diff.pocketOpenings[field.modelId]
  }
}

const getChangedValues = (
  fields: readonly ConstraintFieldSchema[],
  diff: SubProjectDiffSchema,
): ConstraintValueSchema[] => {
  const values: ConstraintValueSchema[] = []
  for (const constraintField of fields) {
    const change = getConstraintModelChange(diff, constraintField)
    if (!isDefined(change?.before) || !isDefined(change.after) || change.before.type !== change.after.type) {
      continue
    }
    const previousValue = getConstraintFieldValue(change.before, constraintField)
    const value = getConstraintFieldValue(change.after, constraintField)
    if (!Object.is(previousValue, value)) {
      values.push(value)
    }
  }
  return values
}

const getExistingField = (
  fields: readonly ConstraintFieldSchema[],
  change: ChangeSchema<ConstraintSchema> | undefined,
): ConstraintFieldSchema | undefined => {
  if (!isDefined(change?.before) || !isDefined(change.after)) {
    return undefined
  }
  const previousFields = change.before.fields
  const hasAddition = change.after.fields.some(
    (constraintField) =>
      fields.some((candidate) => isSameField(candidate, constraintField)) &&
      !previousFields.some((candidate) => isSameField(candidate, constraintField)),
  )
  if (hasAddition) {
    return previousFields.find((constraintField) => fields.some((candidate) => isSameField(candidate, constraintField)))
  }
  return undefined
}

const selectChangedValue = (
  values: readonly ConstraintValueSchema[],
  fallback: ConstraintValueSchema,
): ConstraintValueSchema => {
  const first = values[0]
  return values.every((value) => Object.is(value, first)) ? first : fallback
}

const isValidReference = (
  subProject: SubProjectSchema,
  constraintField: ConstraintFieldSchema,
  value: ConstraintValueSchema,
): boolean => {
  const accessor = accessors.subProject(subProject)
  const model = accessor.constraint.model(constraintField)
  const group = constraintFieldCompatibility[model.type][constraintField.field]
  if (group === 'reference:component') {
    return !isDefined(value) || (typeof value === 'string' && isDefined(accessor.optional.component.byId(value)))
  }
  if (group === 'reference:pocket-opening') {
    return typeof value === 'string' && isDefined(accessor.optional.pocketOpening.byId(value))
  }
  return true
}
