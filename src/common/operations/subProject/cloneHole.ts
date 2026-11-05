import type { HoleSchema } from '../../schemas/hole'
import type { NameGeneratorSchema } from '../../schemas/idGenerator'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneHoleParams = {
  holeId: string
  nameGenerator: NameGeneratorSchema
}

export const cloneHole = (
  subProject: SubProjectSchema,
  { holeId, nameGenerator }: CloneHoleParams,
): SubProjectSchema => {
  const sourceHoleIndex = subProject.holes.findIndex((hole) => hole.id === holeId)

  if (sourceHoleIndex < 0) {
    return subProject
  }

  const idMappings = getCloneIdMappings(subProject)
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
