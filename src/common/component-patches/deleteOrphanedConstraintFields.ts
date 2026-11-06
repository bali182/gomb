import type { ConstraintSchema } from '../schemas/constraints'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedConstraintFields = (
  subProject: SubProjectSchema,
  _computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const constraints: Record<string, ConstraintSchema> = {}
  let hasChanged = false

  for (const [id, constraint] of Object.entries(subProject.constraints)) {
    const fields = constraint.fields.filter((field) => isDefined(accessor.optional.constraint.model(field)))
    if (fields.length !== constraint.fields.length) {
      constraints[id] = { ...constraint, fields }
      hasChanged = true
    } else {
      constraints[id] = constraint
    }
  }

  return hasChanged ? { ...subProject, constraints } : subProject
}
