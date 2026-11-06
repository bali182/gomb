import type { NameGeneratorSchema } from '../../schemas/idGenerator'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneStitchLineParams = {
  stitchLineId: string
  nameGenerator: NameGeneratorSchema
}

export const cloneStitchLine = (
  subProject: SubProjectSchema,
  { stitchLineId, nameGenerator }: CloneStitchLineParams,
): SubProjectSchema => {
  const sourceStitchLineIndex = subProject.stitchLines.findIndex((stitchLine) => stitchLine.id === stitchLineId)

  if (sourceStitchLineIndex < 0) {
    return subProject
  }

  const idMappings = getCloneIdMappings(subProject)
  const sourceStitchLine = subProject.stitchLines[sourceStitchLineIndex]
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  const clonedStitchLine: StitchLineSchema = {
    ...sourceStitchLine,
    id: idMappings[sourceStitchLine.id],
    name: nameGenerator.getByBaseName(sourceStitchLine.name, usedNames),
  }

  return {
    ...subProject,
    stitchLines: [
      ...subProject.stitchLines.slice(0, sourceStitchLineIndex + 1),
      clonedStitchLine,
      ...subProject.stitchLines.slice(sourceStitchLineIndex + 1),
    ],
  }
}
