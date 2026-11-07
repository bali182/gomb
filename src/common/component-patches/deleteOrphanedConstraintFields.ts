import { constraintFieldCompatibility } from '../data/constraintFieldCompatibility'
import type { ConstraintSchema } from '../schemas/constraints'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { has } from '../utils/has'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedConstraintFields = (
  subProject: SubProjectSchema,
  _computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const constraints: Record<string, ConstraintSchema> = {}
  let hasChanged = false

  for (const [id, constraint] of Object.entries(subProject.constraints)) {
    const fields = constraint.fields.filter((field) => {
      const model = accessor.optional.constraint.model(field)
      return isDefined(model) && has(constraintFieldCompatibility[model.type], field.field)
    })
    if (fields.length !== constraint.fields.length) {
      constraints[id] = { ...constraint, fields }
      hasChanged = true
    } else {
      constraints[id] = constraint
    }
  }

  return hasChanged ? { ...subProject, constraints } : subProject
}
