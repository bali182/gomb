import type { ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneConstraintParams = {
  constraintId: string
}

export const cloneConstraint = (
  subProject: SubProjectSchema,
  { constraintId }: CloneConstraintParams,
): SubProjectSchema => {
  const source = accessors.subProject(subProject).optional.constraint.byId(constraintId)
  if (!isDefined(source)) {
    return subProject
  }
  const idMappings = getCloneIdMappings(subProject)
  const constraint: ConstraintSchema = {
    ...source,
    id: idMappings[source.id],
    fields: source.fields.map((field): ConstraintFieldSchema => ({ ...field, id: idMappings[field.id] })),
  }
  return { ...subProject, constraints: { ...subProject.constraints, [constraint.id]: constraint } }
}
