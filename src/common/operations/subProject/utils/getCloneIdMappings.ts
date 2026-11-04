import type { IdGeneratorSchema } from '../../../schemas/idGenerator'
import type { SubProjectSchema } from '../../../schemas/subProject'

export const getCloneIdMappings = (
  subProject: SubProjectSchema,
  idGenerator: IdGeneratorSchema,
): Record<string, string> => {
  const entries: [string, string][] = [
    [subProject.id, idGenerator.get('sub-project')],
    ...Object.values(subProject.components).map((component): [string, string] => [
      component.id,
      idGenerator.getAndForbid('component'),
    ]),
    ...subProject.holes.map((hole): [string, string] => [hole.id, idGenerator.getAndForbid('hole')]),
    ...subProject.stitchLines.map((stitchLine): [string, string] => [
      stitchLine.id,
      idGenerator.getAndForbid('stitch-line'),
    ]),
    ...Object.values(subProject.pocketOpenings).map((opening): [string, string] => [
      opening.id,
      idGenerator.getAndForbid('pocket-opening'),
    ]),
  ]
  const idMappings = Object.fromEntries(entries)
  if (Object.keys(idMappings).length !== entries.length) {
    throw new Error('Duplicate source IDs in clone mapping')
  }
  return idMappings
}
