import type { ConstraintFieldSchema } from '../../../schemas/constraints'
import type { IdGeneratorSchema, IdPrefixSchema } from '../../../schemas/idGenerator'
import type { ModelObjectSchema } from '../../../schemas/modelObject'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { getSubProjectIds } from '../../../utils/idCollectorUtils'

export const getCloneIdMappings = (
  subProject: SubProjectSchema,
  idGenerator: IdGeneratorSchema,
): Record<string, string> => {
  const ids = getSubProjectIds(subProject)

  const entries: [string, string][] = [
    [subProject.id, idGenerator.get('sub-project', ids)],
    ...Object.values(subProject.constraints).flatMap((constraint): [string, string][] => [
      [constraint.id, idGenerator.getAndForbid(getModelIdPrefix(constraint), ids)],
      ...constraint.fields.map((field): [string, string] => [
        field.id,
        idGenerator.getAndForbid(getModelIdPrefix(field), ids),
      ]),
    ]),
    ...Object.values(subProject.components).map((component): [string, string] => [
      component.id,
      idGenerator.getAndForbid(getModelIdPrefix(component), ids),
    ]),
    ...subProject.holes.map((hole): [string, string] => [
      hole.id,
      idGenerator.getAndForbid(getModelIdPrefix(hole), ids),
    ]),
    ...subProject.stitchLines.map((stitchLine): [string, string] => [
      stitchLine.id,
      idGenerator.getAndForbid(getModelIdPrefix(stitchLine), ids),
    ]),
    ...Object.values(subProject.pocketOpenings).map((opening): [string, string] => [
      opening.id,
      idGenerator.getAndForbid(getModelIdPrefix(opening), ids),
    ]),
  ]
  const idMappings = Object.fromEntries(entries)
  if (Object.keys(idMappings).length !== entries.length) {
    throw new Error('Duplicate source IDs in clone mapping')
  }
  return idMappings
}

const getModelIdPrefix = (model: ModelObjectSchema | ConstraintFieldSchema): IdPrefixSchema => {
  switch (model.type) {
    case 'straight':
      return 'straight-pocket-opening'
    case 'recessed':
      return 'recessed-pocket-opening'
    case 'slanted':
      return 'slanted-pocket-opening'
    case 'optical-illusion':
      return 'optical-illusion-pocket-opening'
    default:
      return model.type
  }
}
