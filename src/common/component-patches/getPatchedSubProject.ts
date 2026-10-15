import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { addAutoStitchLineRadii } from './addAutoStitchLineRadii'
import { addComputedSizes } from './addComputedSizes'
import { adjustStitchLines } from './adjustStitchLines'
import { deleteOrphanedHoles } from './deleteOrphanedHoles'
import { deleteOrphanedPocketTopMappings } from './deleteOrphanedPocketTopMappings'
import { deleteOrphanedStitchLines } from './deleteOrphanedStitchLines'

type PatcherFunctionSchema = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
) => SubProjectSchema

const patchers: PatcherFunctionSchema[] = [
  addComputedSizes,
  deleteOrphanedPocketTopMappings,
  deleteOrphanedHoles,
  deleteOrphanedStitchLines,
  adjustStitchLines,
  addAutoStitchLineRadii,
]

export const getPatchedSubProject = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  return patchers.reduce((subProject, patcher) => patcher(subProject, computedSubProject), subProject)
}
