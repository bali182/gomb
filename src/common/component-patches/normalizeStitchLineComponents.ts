import {
  isStitchLineExitComponentAllowed,
  normalizeStitchLineEntryAndExit,
} from '../logic/stitching/stitchLineComponentValidation'
import type { StitchLineSchema } from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'

export const normalizeStitchLineComponents = (
  subProject: SubProjectSchema,
  _computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  let changed = false
  const stitchLines = subProject.stitchLines.map((stitchLine): StitchLineSchema => {
    if (narrowers.is.tPocketStitchLine(stitchLine)) {
      if (
        !isDefined(stitchLine.exitComponentId) ||
        isStitchLineExitComponentAllowed(stitchLine.id, undefined, stitchLine.exitComponentId, accessor)
      ) {
        return stitchLine
      }
      changed = true
      return { ...stitchLine, exitComponentId: undefined }
    }
    const validation = normalizeStitchLineEntryAndExit(stitchLine.id, accessor)
    if (!isDefined(validation) || (validation.entryComponentValid && validation.exitComponentValid)) {
      return stitchLine
    }
    changed = true
    return {
      ...stitchLine,
      entryComponentId: validation.entryComponentValid ? stitchLine.entryComponentId : undefined,
      exitComponentId: validation.exitComponentValid ? stitchLine.exitComponentId : undefined,
    }
  })
  return changed ? { ...subProject, stitchLines } : subProject
}
