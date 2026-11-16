import type { BindingSchema } from '../../schemas/bindings'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { bindingFieldBlockers } from './bindingFieldBlockers'
import { getBindingFieldInputs } from './getBindingFieldInputs'

export type CornerRadiusBindingState = {
  binding: BindingSchema | undefined
  disabledFields: readonly (keyof HasCornerRadiusSchema)[]
  hasMultipleBindings: boolean
}

export const CORNER_RADIUS_FIELD_ORDER: readonly (keyof HasCornerRadiusSchema)[] = [
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
]

const OPENING_CORNERS: Record<PocketOrientationSchema, readonly (keyof HasCornerRadiusSchema)[]> = {
  up: ['topLeftRadius', 'topRightRadius'],
  down: ['bottomLeftRadius', 'bottomRightRadius'],
  left: ['topLeftRadius', 'bottomLeftRadius'],
  right: ['topRightRadius', 'bottomRightRadius'],
}

export const getCornerRadiusBindingState = (
  subProject: SubProjectSchema,
  modelId: string,
): CornerRadiusBindingState | undefined => {
  const accessor = accessors.subProject(subProject)
  const model =
    accessor.optional.component.byId(modelId) ??
    accessor.optional.hole.byId(modelId) ??
    accessor.optional.stitchLine.byId(modelId)
  if (!isDefined(model)) {
    return undefined
  }
  const inputs = getBindingFieldInputs(model)
  if (!CORNER_RADIUS_FIELD_ORDER.every((field) => inputs.some((input) => input.field === field))) {
    return undefined
  }

  const disabledFields = new Set<keyof HasCornerRadiusSchema>()
  if (narrowers.is.pocketCluster(model)) {
    for (const field of OPENING_CORNERS[model.orientation]) {
      disabledFields.add(field)
    }
  } else if (narrowers.is.frontPocket(model)) {
    const parent = narrowers.assert.pocketCluster(accessor.component.parent(model.id))
    for (const field of OPENING_CORNERS[parent.orientation]) {
      disabledFields.add(field)
    }
  }

  const bindings = accessor.binding
    .byModel(modelId)
    .filter((binding) =>
      binding.fields.some(
        (field) => field.modelId === modelId && CORNER_RADIUS_FIELD_ORDER.some((corner) => corner === field.field),
      ),
    )
  const internal = bindings.filter((binding) =>
    binding.fields.every(
      (field) => field.modelId === modelId && CORNER_RADIUS_FIELD_ORDER.some((corner) => corner === field.field),
    ),
  )
  for (const field of CORNER_RADIUS_FIELD_ORDER) {
    const hasExternalBinding = bindings.some(
      (binding) =>
        !internal.includes(binding) &&
        binding.fields.some((member) => member.modelId === modelId && member.field === field),
    )
    if (hasExternalBinding || isDefined(bindingFieldBlockers[model.type][field]?.(model))) {
      disabledFields.add(field)
    }
  }

  return {
    binding: internal.length === 1 ? internal[0] : undefined,
    disabledFields: CORNER_RADIUS_FIELD_ORDER.filter((field) => disabledFields.has(field)),
    hasMultipleBindings: internal.length > 1,
  }
}
