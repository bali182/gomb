import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import type { SubProjectComputationResultSchema } from '../schemas/editorComputation'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { getSubProjectDiff } from '../utils/getSubProjectDiff'
import { applyResolution } from './bindings/applyResolution'
import { getComputedSubProject } from './getComputedSubProject'

export const processSubProjectComputation = (
  subProject: SubProjectSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
  previousSubProject?: SubProjectSchema,
): SubProjectComputationResultSchema => {
  const inputDiff = getSubProjectDiff(previousSubProject, subProject)
  const bound = applyResolution({ input: subProject, target: subProject, inputDiff })
  const computed = getComputedSubProject(bound, stitchingSettings)
  const patched = getPatchedSubProject(bound, computed)
  const patchDiff = getSubProjectDiff(bound, patched)
  const resolved = applyResolution({ input: bound, target: patched, inputDiff, patchDiff })
  return {
    subProject: resolved,
    computedSubProject: resolved === bound ? computed : getComputedSubProject(resolved, stitchingSettings),
  }
}
