import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import type { EditorComputationRequestSchema, EditorComputationResultSchema } from '../schemas/editorComputation'
import { accessors } from '../utils/accessors'
import { getComputedSubProject } from './getComputedSubProject'

export const processEditorComputation = (request: EditorComputationRequestSchema): EditorComputationResultSchema => {
  const { project, requestId, subProjectId } = request
  const subProject = accessors.project(project).subProject(subProjectId)
  const computed = getComputedSubProject(subProject, project.stitchingSettings)
  const patched = getPatchedSubProject(subProject, computed)
  const computedSubProject =
    patched === subProject ? computed : getComputedSubProject(patched, project.stitchingSettings)

  return {
    requestId,
    project: {
      ...project,
      subProjects: project.subProjects.map((candidate) => (candidate.id === subProjectId ? patched : candidate)),
    },
    computedSubProject,
  }
}
