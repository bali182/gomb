import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import type { ConstraintFieldBlockReasonSchema, ConstraintFieldNameSchema } from '../../schemas/constraints'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { constraintFieldBlockers } from './constraintFieldBlockers'
import { getConstraintFieldInputs } from './getConstraintFieldInputs'

export type ConstraintPropertyBlocker = {
  model: ModelObjectSchema
  alreadyConstrained: boolean
  autoReason: ConstraintFieldBlockReasonSchema | undefined
}

export type CommonConstraintProperty = {
  field: ConstraintFieldNameSchema
  fields: ConstraintFieldInputSchema[]
  blockers: ConstraintPropertyBlocker[]
}

export const getCommonConstraintProperties = (
  subProject: SubProjectSchema,
  models: ModelObjectSchema[],
): CommonConstraintProperty[] => {
  const first = models[0]
  if (!isDefined(first)) {
    return []
  }
  const accessor = accessors.subProject(subProject)
  const available = models.map(getConstraintFieldInputs)
  return getConstraintFieldInputs(first).flatMap((field): CommonConstraintProperty[] => {
    const group = constraintFieldCompatibility[first.type][field.field]
    if (!isDefined(group)) {
      return []
    }
    const fields: ConstraintFieldInputSchema[] = []
    const blockers: ConstraintPropertyBlocker[] = []
    for (const [index, model] of models.entries()) {
      const input = available[index].find((candidate) => candidate.field === field.field)
      if (!isDefined(input) || constraintFieldCompatibility[model.type][field.field] !== group) {
        return []
      }
      fields.push(input)
      const alreadyConstrained = accessor.constraint.byField(model.id, field.field).length > 0
      const autoReason = constraintFieldBlockers[model.type][field.field]?.(model)
      if (alreadyConstrained || isDefined(autoReason)) {
        blockers.push({ model, alreadyConstrained, autoReason })
      }
    }
    return [{ field: field.field, fields, blockers }]
  })
}

export const getValidConstraintPropertySelection = (
  properties: CommonConstraintProperty[],
  selection: ConstraintFieldNameSchema[],
): ConstraintFieldNameSchema[] =>
  selection.filter((field) => properties.some((property) => property.field === field && property.blockers.length === 0))
