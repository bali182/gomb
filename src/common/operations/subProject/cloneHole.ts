import type { HoleSchema } from '../../schemas/hole'
import type { BaseOperationParamsSchema, CloneHoleParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export const cloneHole = (
  { subProject, id: idGenerator, name: nameGenerator }: BaseOperationParamsSchema,
  { id: holeId }: CloneHoleParamsSchema,
): SubProjectSchema => {
  const sourceHoleIndex = subProject.holes.findIndex((hole) => hole.id === holeId)

  if (sourceHoleIndex < 0) {
    return subProject
  }

  const idMappings = getCloneIdMappings(subProject, idGenerator)
  const sourceHole = subProject.holes[sourceHoleIndex]
  const usedNames = new Set(subProject.holes.map((hole) => hole.name))
  const clonedHole: HoleSchema = {
    ...sourceHole,
    id: idMappings[sourceHole.id],
    name: nameGenerator.getByBaseName(sourceHole.name, usedNames),
  }

  return {
    ...subProject,
    holes: [
      ...subProject.holes.slice(0, sourceHoleIndex + 1),
      clonedHole,
      ...subProject.holes.slice(sourceHoleIndex + 1),
    ],
  }
}
