import type { LoadableSchema } from './loadable'
import type { ProjectSchema } from './project'
import type { ComputedSubProjectSchema } from './subProject'

export type EditorComputationRequestSchema = {
  requestId: number
  project: ProjectSchema
  subProjectId: string
}

export type EditorComputationResultSchema = {
  requestId: number
  project: ProjectSchema
  computedSubProject: ComputedSubProjectSchema
}

export type EditorComputationCompletedSchema = {
  type: 'completed'
  requestId: number
  result: EditorComputationResultSchema
}

export type EditorComputationFailedSchema = {
  type: 'failed'
  requestId: number
  error: string
}

export type EditorComputationResponseSchema = EditorComputationCompletedSchema | EditorComputationFailedSchema

export type EditorComputationStateSchema = {
  requestId: number
  result: LoadableSchema<EditorComputationResultSchema>
}

export type EditorComputationControlSchema = {
  getRequestId: () => number
  waitUntilIdle: () => Promise<EditorComputationResultSchema>
}
