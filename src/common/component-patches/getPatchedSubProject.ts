import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { addAutoStitchLineRadii } from './addAutoStitchLineRadii'
import { addComputedSizes } from './addComputedSizes'
import { adjustStitchLines } from './adjustStitchLines'
import { deleteOrphanedHoles } from './deleteOrphanedHoles'
import { deleteOrphanedStitchLines } from './deleteOrphanedStitchLines'
import { deletePocketClusterHoles } from './deletePocketClusterHoles'
import { deleteTPocketChildren } from './deleteTPocketChildren'
import { deleteUnsupportedStitchLines } from './deleteUnsupportedStitchLines'

type PatcherFunctionSchema = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
) => SubProjectSchema

const patchers: PatcherFunctionSchema[] = [
  deleteTPocketChildren,
  addComputedSizes,
  deletePocketClusterHoles,
  deleteUnsupportedStitchLines,
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
