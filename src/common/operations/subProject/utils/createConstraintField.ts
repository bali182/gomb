import typia from 'typia'
import type { ConstraintFieldNameSchema, ConstraintFieldSchema } from '../../../schemas/constraints'
import type { ModelObjectSchema } from '../../../schemas/modelObject'

// TODO this is garbage don't leave it like this. If you read this let me know!!!!
export const createConstraintField = (
  id: string,
  model: ModelObjectSchema,
  field: ConstraintFieldNameSchema,
): ConstraintFieldSchema | undefined => {
  const candidate = {
    id,
    type: `${model.type}-constraint-field`,
    modelId: model.id,
    field,
  }

  return typia.is<ConstraintFieldSchema>(candidate) ? candidate : undefined
}
