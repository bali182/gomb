import type { ConstraintFieldNameSchema, ConstraintSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { TranslationSchema } from '../../translations/translationSchema'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type ConstraintFieldAdderState = {
  modelId: string | undefined
  property: ConstraintFieldNameSchema | undefined
}

export const getConstraintFieldLabel = (field: ConstraintFieldNameSchema, t: TranslationSchema): string =>
  t.project.editors.enums.constraints.fields[field]

export const getConstraintLabel = (constraint: ConstraintSchema, t: TranslationSchema): string => {
  if (constraint.fields.length === 0) {
    return t.project.editors.sections.constraints.empty
  }

  const counts = new Map<ConstraintFieldNameSchema, number>()
  for (const field of constraint.fields) {
    counts.set(field.field, (counts.get(field.field) ?? 0) + 1)
  }

  return Array.from(counts, ([field, count]) => {
    const label = getConstraintFieldLabel(field, t)
    return count > 1 ? `${label} (${count})` : label
  }).join(', ')
}

export const getConstraintModelPath = (model: ModelObjectSchema, subProject: SubProjectSchema): ModelObjectSchema[] => {
  const accessor = accessors.subProject(subProject)
  if (narrowers.is.pocketOpening(model)) {
    return [model]
  }
  if (narrowers.is.hole(model)) {
    return [...getConstraintModelPath(accessor.component.byId(model.componentId), subProject), model]
  }
  if (narrowers.is.stitchLine(model)) {
    const target =
      model.targetType === 'component' ? accessor.component.byId(model.targetId) : accessor.hole.byId(model.targetId)
    return [...getConstraintModelPath(target, subProject), model]
  }
  const path: ModelObjectSchema[] = [model]
  let parent = accessor.optional.component.parent(model.id)
  while (isDefined(parent)) {
    path.unshift(parent)
    parent = accessor.optional.component.parent(parent.id)
  }
  return path
}
