import type { BaseSubProjectOperationParamsSchema, DeleteStitchLineParamsSchema } from '../../schemas/operations'
import { SubProjectSchema } from '../../schemas/subProject'

export const deleteStitchLine = (
  { subProject }: BaseSubProjectOperationParamsSchema,
  { id }: DeleteStitchLineParamsSchema,
): SubProjectSchema => {
  return {
    ...subProject,
    stitchLines: subProject.stitchLines.filter((stitchLine) => stitchLine.id !== id),
  }
}
