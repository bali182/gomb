import type { BindingFieldNameSchema, BindingSchema } from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { TranslationSchema } from '../../translations/translationSchema'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type BindingFieldAdderState = {
  modelId: string | undefined
  property: BindingFieldNameSchema | undefined
}

export const getBindingFieldLabel = (field: BindingFieldNameSchema, t: TranslationSchema): string =>
  t.project.editors.enums.bindings.fields[field]

export const getBindingLabel = (binding: BindingSchema, t: TranslationSchema): string => {
  if (binding.fields.length === 0) {
    return t.project.editors.sections.bindings.empty
  }

  const counts = new Map<BindingFieldNameSchema, number>()
  for (const field of binding.fields) {
    counts.set(field.field, (counts.get(field.field) ?? 0) + 1)
  }

  return Array.from(counts, ([field, count]) => {
    const label = getBindingFieldLabel(field, t)
    return count > 1 ? `${label} (${count})` : label
  }).join(', ')
}

export const getBindingModelPath = (model: ModelObjectSchema, subProject: SubProjectSchema): ModelObjectSchema[] => {
  const accessor = accessors.subProject(subProject)
  if (narrowers.is.pocketOpening(model)) {
    return [model]
  }
  if (narrowers.is.hole(model)) {
    return [...getBindingModelPath(accessor.component.byId(model.componentId), subProject), model]
  }
  if (narrowers.is.stitchLine(model)) {
    const target =
      model.targetType === 'component' ? accessor.component.byId(model.targetId) : accessor.hole.byId(model.targetId)
    return [...getBindingModelPath(target, subProject), model]
  }
  const path: ModelObjectSchema[] = [model]
  let parent = accessor.optional.component.parent(model.id)
  while (isDefined(parent)) {
    path.unshift(parent)
    parent = accessor.optional.component.parent(parent.id)
  }
  return path
}
