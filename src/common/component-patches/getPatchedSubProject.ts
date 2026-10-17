import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { addAutoStitchLineRadii } from './addAutoStitchLineRadii'
import { addComputedSizes } from './addComputedSizes'
import { adjustStitchLines } from './adjustStitchLines'
import { deleteOrphanedHoles } from './deleteOrphanedHoles'
import { deleteOrphanedPocketOpeningMappings } from './deleteOrphanedPocketOpeningMappings'
import { deleteOrphanedStitchLines } from './deleteOrphanedStitchLines'

type PatcherFunctionSchema = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
) => SubProjectSchema

const patchers: PatcherFunctionSchema[] = [
  addComputedSizes,
  deleteOrphanedPocketOpeningMappings,
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
