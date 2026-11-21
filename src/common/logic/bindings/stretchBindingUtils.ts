import type { BindingSchema } from '../../schemas/bindings'
import type { HasStretchSchema } from '../../schemas/common'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type StretchBindingState = {
  binding: BindingSchema | undefined
  disabledFields: readonly (keyof HasStretchSchema)[]
  hasMultipleBindings: boolean
}

export const STRETCH_FIELD_ORDER: readonly (keyof HasStretchSchema)[] = [
  'topStretch',
  'rightStretch',
  'bottomStretch',
  'leftStretch',
]

export const getStretchBindingState = (
  subProject: SubProjectSchema,
  modelId: string,
): StretchBindingState | undefined => {
  const accessor = accessors.subProject(subProject)
  const model = accessor.optional.component.byId(modelId) ?? accessor.optional.hole.byId(modelId)
  if (
    !isDefined(model) ||
    (!narrowers.is.guide(model) &&
      !narrowers.is.panel(model) &&
      !narrowers.is.pocketCluster(model) &&
      !narrowers.is.hole(model))
  ) {
    return undefined
  }

  const bindings = accessor.binding
    .byModel(modelId)
    .filter((binding) =>
      binding.fields.some(
        (field) => field.modelId === modelId && STRETCH_FIELD_ORDER.some((stretch) => stretch === field.field),
      ),
    )
  const internal = bindings.filter((binding) =>
    binding.fields.every(
      (field) => field.modelId === modelId && STRETCH_FIELD_ORDER.some((stretch) => stretch === field.field),
    ),
  )
  const disabledFields = STRETCH_FIELD_ORDER.filter((field) =>
    bindings.some(
      (binding) =>
        !internal.includes(binding) &&
        binding.fields.some((member) => member.modelId === modelId && member.field === field),
    ),
  )

  return {
    binding: internal.length === 1 ? internal[0] : undefined,
    disabledFields,
    hasMultipleBindings: internal.length > 1,
  }
}
