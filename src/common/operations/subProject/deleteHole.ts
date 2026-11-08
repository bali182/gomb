import type { BaseSubProjectOperationParamsSchema, DeleteHoleParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'

export const deleteHole = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeleteHoleParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    holes: subProject.holes.filter((hole) => hole.id !== id),
  }
}
