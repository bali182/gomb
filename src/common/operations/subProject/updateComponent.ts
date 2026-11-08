import type { BaseOperationParamsSchema, UpdateComponentParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'

export const updateComponent = (
  { subProject }: BaseOperationParamsSchema,
  { component }: UpdateComponentParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    components: {
      ...subProject.components,
      [component.id]: component,
    },
  }
}
