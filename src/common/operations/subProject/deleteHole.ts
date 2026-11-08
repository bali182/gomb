import type { BaseOperationParamsSchema, DeleteHoleParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'

export const deleteHole = (
  { subProject }: BaseOperationParamsSchema,
  { id }: DeleteHoleParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    holes: subProject.holes.filter((hole) => hole.id !== id),
  }
}
