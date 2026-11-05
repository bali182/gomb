import type { ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import type { IdGeneratorSchema } from '../../schemas/idGenerator'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { addConstraint } from './addConstraint'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneConstraintParams = {
  constraintId: string
  idGenerator: IdGeneratorSchema
}

export const cloneConstraint = (
  subProject: SubProjectSchema,
  { constraintId, idGenerator }: CloneConstraintParams,
): SubProjectSchema => {
  const source = accessors.subProject(subProject).optional.constraint.byId(constraintId)
  if (!isDefined(source)) {
    return subProject
  }
  const idMappings = getCloneIdMappings(subProject, idGenerator)
  const constraint: ConstraintSchema = {
    ...source,
    id: idMappings[source.id],
    fields: source.fields.map((field): ConstraintFieldSchema => ({ ...field, id: idMappings[field.id] })),
  }
  return addConstraint(subProject, { constraint })
}
