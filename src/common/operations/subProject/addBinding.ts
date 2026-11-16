import type { AddBindingParamsSchema, BaseSubProjectOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getSubProjectIds } from '../../utils/idCollectorUtils'

export const addBinding = (
  { subProject, readonlyFactory }: BaseSubProjectOperationParamsSchema,
  { type }: AddBindingParamsSchema,
): SubProjectSchema => {
  const binding = readonlyFactory.createBinding({ type, forbiddenIds: getSubProjectIds(subProject) })
  return { ...subProject, bindings: { ...subProject.bindings, [binding.id]: binding } }
}
