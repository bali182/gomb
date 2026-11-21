import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { addAutoStitchLineRadii } from './addAutoStitchLineRadii'
import { addComputedHoleSizes } from './addComputedHoleSizes'
import { addComputedSizes } from './addComputedSizes'
import { adjustStitchLines } from './adjustStitchLines'
import { deleteOrphanedBindingFields } from './deleteOrphanedBindingFields'
import { deleteOrphanedHoles } from './deleteOrphanedHoles'
import { deleteOrphanedStitchLines } from './deleteOrphanedStitchLines'
import { deletePocketClusterHoles } from './deletePocketClusterHoles'
import { deleteTPocketChildren } from './deleteTPocketChildren'
import { deleteUnsupportedStitchLines } from './deleteUnsupportedStitchLines'
import { normalizeStitchLineComponents } from './normalizeStitchLineComponents'

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
  addComputedHoleSizes,
  deleteOrphanedStitchLines,
  normalizeStitchLineComponents,
  adjustStitchLines,
  addAutoStitchLineRadii,
  deleteOrphanedBindingFields,
]

export const getPatchedSubProject = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  return patchers.reduce((subProject, patcher) => patcher(subProject, computedSubProject), subProject)
}
