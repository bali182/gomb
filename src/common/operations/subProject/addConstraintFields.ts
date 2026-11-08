import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { constraintFieldBlockers } from '../../logic/constraints/constraintFieldBlockers'
import type { ConstraintFieldSchema } from '../../schemas/constraints'
import type { AddConstraintFieldsParamsSchema, BaseOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const addConstraintFields = (
  { subProject, readonlyFactory }: BaseOperationParamsSchema,
  { constraintId, fields: inputs }: AddConstraintFieldsParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const constraint = accessor.optional.constraint.byId(constraintId)
  if (!isDefined(constraint)) {
    return subProject
  }
  const forbiddenIds = getSubProjectIds(subProject)
  const fields: ConstraintFieldSchema[] = [...constraint.fields]
  for (const input of inputs) {
    const field = readonlyFactory.createConstraintField({ ...input, forbiddenIds })
    const model = accessor.optional.constraint.model(field)
    if (!isDefined(model)) {
      continue
    }
    const group = constraintFieldCompatibility[model.type][field.field]
    const blocked = constraintFieldBlockers[model.type][field.field]?.(model)
    if (
      !isDefined(group) ||
      isDefined(blocked) ||
      accessor.constraint.byField(field.modelId, field.field).length > 0 ||
      fields.some((member) => member.modelId === field.modelId && member.field === field.field)
    ) {
      continue
    }
    const compatible = fields.every((member) => {
      const memberModel = accessor.optional.constraint.model(member)
      return isDefined(memberModel) && constraintFieldCompatibility[memberModel.type][member.field] === group
    })
    if (compatible) {
      fields.push(field)
      forbiddenIds.add(field.id)
    }
  }
  if (fields.length === constraint.fields.length) {
    return subProject
  }
  return {
    ...subProject,
    constraints: {
      ...subProject.constraints,
      [constraintId]: { ...constraint, fields },
    },
  }
}
