import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { constraintFieldBlockers } from '../../logic/constraints/constraintFieldBlockers'
import type { ConstraintFieldInputSchema, ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export type AddConstraintFieldParams = {
  constraintId: string
  field: ConstraintFieldInputSchema
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const addConstraintField = (
  subProject: SubProjectSchema,
  { constraintId, field: input, modelFactory }: AddConstraintFieldParams,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const constraint = accessor.optional.constraint.byId(constraintId)
  if (!isDefined(constraint)) {
    return subProject
  }
  const field = modelFactory.createConstraintField({ ...input, forbiddenIds: getSubProjectIds(subProject) })
  const model = accessor.optional.constraint.model(field)
  if (!isDefined(model)) {
    return subProject
  }
  const group = constraintFieldCompatibility[model.type][field.field]
  const blocked = constraintFieldBlockers[model.type][field.field]?.(model)
  if (
    !isDefined(group) ||
    isDefined(blocked) ||
    constraint.fields.some((member) => member.modelId === field.modelId && member.field === field.field)
  ) {
    return subProject
  }
  for (const member of constraint.fields) {
    const memberModel = accessor.optional.constraint.model(member)
    if (!isDefined(memberModel) || constraintFieldCompatibility[memberModel.type][member.field] !== group) {
      return subProject
    }
  }
  return {
    ...subProject,
    constraints: {
      ...subProject.constraints,
      [constraintId]: { ...constraint, fields: [...constraint.fields, field] },
    },
  }
}
