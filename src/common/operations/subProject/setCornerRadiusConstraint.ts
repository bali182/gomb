import {
  CORNER_RADIUS_FIELD_ORDER,
  getCornerRadiusConstraintState,
} from '../../logic/constraints/cornerRadiusConstraintUtils'
import { getConstraintFieldInputs } from '../../logic/constraints/getConstraintFieldInputs'
import type { ConstraintFieldSchema } from '../../schemas/constraints'
import type {
  BaseSubProjectOperationParamsSchema,
  SetCornerRadiusConstraintParamsSchema,
} from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const setCornerRadiusConstraint = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { modelId, fields: selectedFields }: SetCornerRadiusConstraintParamsSchema,
): SubProjectSchema => {
  const state = getCornerRadiusConstraintState(subProject, modelId)
  if (
    !isDefined(state) ||
    state.hasMultipleConstraints ||
    selectedFields.some((field) => state.disabledFields.includes(field))
  ) {
    return subProject
  }
  const selected = CORNER_RADIUS_FIELD_ORDER.filter((field) => selectedFields.includes(field))
  const existing = state.constraint
  if (selected.length < 2) {
    if (!isDefined(existing)) {
      return subProject
    }
    const constraints = { ...subProject.constraints }
    delete constraints[existing.id]
    return { ...subProject, constraints }
  }
  if (
    isDefined(existing) &&
    existing.fields.length === selected.length &&
    existing.fields.every((field, index) => field.field === selected[index])
  ) {
    return subProject
  }

  const accessor = accessors.subProject(subProject)
  const model =
    accessor.optional.component.byId(modelId) ??
    accessor.optional.hole.byId(modelId) ??
    accessor.optional.stitchLine.byId(modelId)
  if (!isDefined(model)) {
    return subProject
  }
  const inputs = getConstraintFieldInputs(model)
  const forbiddenIds = getSubProjectIds(subProject)
  const constraint = existing ?? readonlyFactory.createConstraint({ type: 'equal-constraint', forbiddenIds })
  forbiddenIds.add(constraint.id)
  const fields: ConstraintFieldSchema[] = []
  for (const field of selected) {
    const member = existing?.fields.find((member) => member.field === field)
    if (isDefined(member)) {
      fields.push(member)
      continue
    }
    const input = inputs.find((input) => input.field === field)
    if (!isDefined(input)) {
      return subProject
    }
    const added = readonlyFactory.createConstraintField({ ...input, forbiddenIds })
    forbiddenIds.add(added.id)
    fields.push(added)
  }
  return {
    ...subProject,
    constraints: { ...subProject.constraints, [constraint.id]: { ...constraint, fields } },
  }
}
