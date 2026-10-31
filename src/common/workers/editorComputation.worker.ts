import { processEditorComputation } from '../logic/processEditorComputation'
import type { EditorComputationRequestSchema, EditorComputationResponseSchema } from '../schemas/editorComputation'
import { deserializeEditorComputation, serializeEditorComputation } from '../utils/editorComputationSerialization'

self.addEventListener('message', (event: MessageEvent<string>): void => {
  const request = deserializeEditorComputation<EditorComputationRequestSchema>(event.data)
  let response: EditorComputationResponseSchema
  try {
    response = { type: 'completed', requestId: request.requestId, result: processEditorComputation(request) }
  } catch (error) {
    console.error('[worker]', error)
    response = {
      type: 'failed',
      requestId: request.requestId,
      error: error instanceof Error ? error.message : String(error),
    }
  }
  self.postMessage(serializeEditorComputation(response))
})
