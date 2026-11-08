import type { BaseOperationParamsSchema, UpdateStitchLineParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'

export const updateStitchLine = (
  { subProject }: BaseOperationParamsSchema,
  { stitchLine }: UpdateStitchLineParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    stitchLines: subProject.stitchLines.map((s) => (s.id === stitchLine.id ? stitchLine : s)),
  }
}
