import { CORNER_RADIUS_FIELD_ORDER, getCornerRadiusBindingState } from '../../logic/bindings/cornerRadiusBindingUtils'
import { getBindingFieldInputs } from '../../logic/bindings/getBindingFieldInputs'
import type { BindingFieldSchema } from '../../schemas/bindings'
import type { BaseSubProjectOperationParamsSchema, SetCornerRadiusBindingParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export const setCornerRadiusBinding = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { modelId, fields: selectedFields }: SetCornerRadiusBindingParamsSchema,
): SubProjectSchema => {
  const state = getCornerRadiusBindingState(subProject, modelId)
  if (
    !isDefined(state) ||
    state.hasMultipleBindings ||
    selectedFields.some((field) => state.disabledFields.includes(field))
  ) {
    return subProject
  }
  const selected = CORNER_RADIUS_FIELD_ORDER.filter((field) => selectedFields.includes(field))
  const existing = state.binding
  if (selected.length < 2) {
    if (!isDefined(existing)) {
      return subProject
    }
    const bindings = { ...subProject.bindings }
    delete bindings[existing.id]
    return { ...subProject, bindings }
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
  const inputs = getBindingFieldInputs(model)
  const forbiddenIds = getSubProjectIds(subProject)
  const binding = existing ?? readonlyFactory.createBinding({ type: 'equal-binding', forbiddenIds })
  forbiddenIds.add(binding.id)
  const fields: BindingFieldSchema[] = []
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
    const added = readonlyFactory.createBindingField({ ...input, forbiddenIds })
    forbiddenIds.add(added.id)
    fields.push(added)
  }
  return {
    ...subProject,
    bindings: { ...subProject.bindings, [binding.id]: { ...binding, fields } },
  }
}
