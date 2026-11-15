import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { constraintFieldBlockers } from './constraintFieldBlockers'
import { getConstraintFieldInputs } from './getConstraintFieldInputs'

type CornerRadiusConstraintState = {
  constraint: ConstraintSchema | undefined
  disabledFields: readonly (keyof HasCornerRadiusSchema)[]
  hasMultipleConstraints: boolean
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

export const getCornerRadiusConstraintState = (
  subProject: SubProjectSchema,
  modelId: string,
): CornerRadiusConstraintState | undefined => {
  const accessor = accessors.subProject(subProject)
  const model =
    accessor.optional.component.byId(modelId) ??
    accessor.optional.hole.byId(modelId) ??
    accessor.optional.stitchLine.byId(modelId)
  if (!isDefined(model)) {
    return undefined
  }
  const inputs = getConstraintFieldInputs(model)
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

  const constraints = accessor.constraint
    .byModel(modelId)
    .filter((constraint) =>
      constraint.fields.some(
        (field) => field.modelId === modelId && CORNER_RADIUS_FIELD_ORDER.some((corner) => corner === field.field),
      ),
    )
  const internal = constraints.filter((constraint) =>
    constraint.fields.every(
      (field) => field.modelId === modelId && CORNER_RADIUS_FIELD_ORDER.some((corner) => corner === field.field),
    ),
  )
  for (const field of CORNER_RADIUS_FIELD_ORDER) {
    const hasExternalConstraint = constraints.some(
      (constraint) =>
        !internal.includes(constraint) &&
        constraint.fields.some((member) => member.modelId === modelId && member.field === field),
    )
    if (hasExternalConstraint || isDefined(constraintFieldBlockers[model.type][field]?.(model))) {
      disabledFields.add(field)
    }
  }

  return {
    constraint: internal.length === 1 ? internal[0] : undefined,
    disabledFields: CORNER_RADIUS_FIELD_ORDER.filter((field) => disabledFields.has(field)),
    hasMultipleConstraints: internal.length > 1,
  }
}
