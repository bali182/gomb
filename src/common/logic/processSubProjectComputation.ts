import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import type { SubProjectComputationResultSchema } from '../schemas/editorComputation'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { getSubProjectDiff } from '../utils/getSubProjectDiff'
import { applyResolution } from './constraints/applyResolution'
import { getComputedSubProject } from './getComputedSubProject'

export const processSubProjectComputation = (
  subProject: SubProjectSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
  previousSubProject?: SubProjectSchema,
): SubProjectComputationResultSchema => {
  const inputDiff = getSubProjectDiff(previousSubProject, subProject)
  const constrained = applyResolution({ input: subProject, target: subProject, inputDiff })
  const computed = getComputedSubProject(constrained, stitchingSettings)
  const patched = getPatchedSubProject(constrained, computed)
  const patchDiff = getSubProjectDiff(constrained, patched)
  const resolved = applyResolution({ input: constrained, target: patched, inputDiff, patchDiff })
  return {
    subProject: resolved,
    computedSubProject: resolved === constrained ? computed : getComputedSubProject(resolved, stitchingSettings),
  }
}
