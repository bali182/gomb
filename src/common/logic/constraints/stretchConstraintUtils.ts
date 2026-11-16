import type { HasStretchSchema } from '../../schemas/common'
import type { BindingSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type StretchConstraintState = {
  constraint: BindingSchema | undefined
  disabledFields: readonly (keyof HasStretchSchema)[]
  hasMultipleConstraints: boolean
}

export const STRETCH_FIELD_ORDER: readonly (keyof HasStretchSchema)[] = [
  'topStretch',
  'rightStretch',
  'bottomStretch',
  'leftStretch',
]

export const getStretchConstraintState = (
  subProject: SubProjectSchema,
  modelId: string,
): StretchConstraintState | undefined => {
  const accessor = accessors.subProject(subProject)
  const model = accessor.optional.component.byId(modelId)
  if (!isDefined(model) || (!narrowers.is.panel(model) && !narrowers.is.pocketCluster(model))) {
    return undefined
  }

  const constraints = accessor.constraint
    .byModel(modelId)
    .filter((constraint) =>
      constraint.fields.some(
        (field) => field.modelId === modelId && STRETCH_FIELD_ORDER.some((stretch) => stretch === field.field),
      ),
    )
  const internal = constraints.filter((constraint) =>
    constraint.fields.every(
      (field) => field.modelId === modelId && STRETCH_FIELD_ORDER.some((stretch) => stretch === field.field),
    ),
  )
  const disabledFields = STRETCH_FIELD_ORDER.filter((field) =>
    constraints.some(
      (constraint) =>
        !internal.includes(constraint) &&
        constraint.fields.some((member) => member.modelId === modelId && member.field === field),
    ),
  )

  return {
    constraint: internal.length === 1 ? internal[0] : undefined,
    disabledFields,
    hasMultipleConstraints: internal.length > 1,
  }
}
