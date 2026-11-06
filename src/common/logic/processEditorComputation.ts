import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import type {
  EditorComputationRequestSchema,
  EditorComputationResultSchema,
  SubProjectComputationResultSchema,
} from '../schemas/editorComputation'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
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

export const processEditorComputation = (request: EditorComputationRequestSchema): EditorComputationResultSchema => {
  const { project, requestId, subProjectId } = request
  const subProject = accessors.project(project).subProject(subProjectId)
  const result = processSubProjectComputation(subProject, project.stitchingSettings, request.previousSubProject)

  return {
    requestId,
    project: {
      ...project,
      subProjects: project.subProjects.map((candidate) =>
        candidate.id === subProjectId ? result.subProject : candidate,
      ),
    },
    computedSubProject: result.computedSubProject,
  }
}
