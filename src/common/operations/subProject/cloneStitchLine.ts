import type { IdGeneratorSchema } from '../../schemas/idGenerator'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneStitchLineParams = {
  stitchLineId: string
  idGenerator: IdGeneratorSchema
  getUnusedName: (sourceName: string, usedNames: Set<string>) => string
}

export const cloneStitchLine = (
  subProject: SubProjectSchema,
  { stitchLineId, idGenerator, getUnusedName }: CloneStitchLineParams,
): SubProjectSchema => {
  const sourceStitchLineIndex = subProject.stitchLines.findIndex((stitchLine) => stitchLine.id === stitchLineId)

  if (sourceStitchLineIndex < 0) {
    return subProject
  }

  const idMappings = getCloneIdMappings(subProject, idGenerator)
  const sourceStitchLine = subProject.stitchLines[sourceStitchLineIndex]
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  const clonedStitchLine: StitchLineSchema = {
    ...sourceStitchLine,
    id: idMappings[sourceStitchLine.id],
    name: getUnusedName(sourceStitchLine.name, usedNames),
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
