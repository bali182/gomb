import type { BaseOperationParamsSchema, UpdateHoleParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'

export const updateHole = (
  { subProject }: BaseOperationParamsSchema,
  { hole }: UpdateHoleParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    holes: subProject.holes.map((candidate) => (candidate.id === hole.id ? hole : candidate)),
  }
}
