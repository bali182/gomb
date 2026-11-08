import type { BaseSubProjectOperationParamsSchema, UpdateComponentParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'

export const updateComponent = (
  { subProject }: BaseSubProjectOperationParamsSchema,
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
