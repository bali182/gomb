import type {
  EditorComputationRequestSchema,
  EditorComputationResponseSchema,
  EditorComputationResultSchema,
} from '../schemas/editorComputation'
import { deserializeEditorComputation, serializeEditorComputation } from '../utils/editorComputationSerialization'
import { isDefined } from '../utils/isDefined'
import EditorComputationWorker from './editorComputation.worker?worker'

type PendingComputation = {
  request: EditorComputationRequestSchema
  isCurrent: (requestId: number) => boolean
  resolve: (result: EditorComputationResultSchema | undefined) => void
  reject: (error: unknown) => void
}

export const createEditorComputationWorker = (): {
  compute: (
    request: EditorComputationRequestSchema,
    isCurrent: (requestId: number) => boolean,
  ) => Promise<EditorComputationResultSchema | undefined>
  terminate: () => void
} => {
  let worker: Worker | undefined
  let pending: PendingComputation | undefined
  let terminated = false

  const stopWorker = (): void => {
    worker?.removeEventListener('message', handleMessage)
    worker?.removeEventListener('error', handleError)
    worker?.removeEventListener('messageerror', handleMessageError)
    worker?.terminate()
    worker = undefined
  }

  const fail = (error: unknown): void => {
    const current = pending
    pending = undefined
    stopWorker()
    current?.reject(error)
  }

  const handleMessage = (event: MessageEvent<string>): void => {
    if (!isDefined(worker) || event.currentTarget !== worker || !isDefined(pending)) {
      return
    }
    try {
      const current = pending
      if (!current.isCurrent(current.request.requestId)) {
        pending = undefined
        current.resolve(undefined)
        return
      }
      const response = deserializeEditorComputation<EditorComputationResponseSchema>(event.data)
      if (response.requestId !== current.request.requestId) {
        throw new Error('Editor computation response does not match its request')
      }
      switch (response.type) {
        case 'completed': {
          const result = response.result
          if (
            result.requestId !== current.request.requestId ||
            result.project.id !== current.request.project.id ||
            result.computedSubProject.id !== current.request.subProjectId
          ) {
            throw new Error('Editor computation result does not match its request')
          }
          pending = undefined
          current.resolve(result)
          break
        }
        case 'failed':
          pending = undefined
          current.reject(new Error(response.error))
          break
        default:
          throw new Error('Unexpected editor computation response')
      }
    } catch (error) {
      console.error('[worker]', error)
      fail(error)
    }
  }

  const handleError = (event: ErrorEvent): void => {
    if (event.currentTarget === worker) {
      event.preventDefault()
      console.error('[worker]', event.error ?? event.message)
      fail(new Error(event.message))
    }
  }

  const handleMessageError = (event: MessageEvent): void => {
    if (event.currentTarget === worker) {
      const error = new Error('Unable to receive editor computation response')
      console.error('[worker]', error)
      fail(error)
    }
  }

  const compute = (
    request: EditorComputationRequestSchema,
    isCurrent: (requestId: number) => boolean,
  ): Promise<EditorComputationResultSchema | undefined> => {
    if (terminated) {
      return Promise.reject(new Error('Editor computation worker was terminated'))
    }
    if (isDefined(pending)) {
      return Promise.reject(new Error('Editor computation worker is already processing a request'))
    }
    return new Promise((resolve, reject) => {
      pending = { request, isCurrent, resolve, reject }
      try {
        if (!isDefined(worker)) {
          worker = new EditorComputationWorker()
          worker.addEventListener('message', handleMessage)
          worker.addEventListener('error', handleError)
          worker.addEventListener('messageerror', handleMessageError)
        }
        worker.postMessage(serializeEditorComputation(request))
      } catch (error) {
        console.error('[worker]', error)
        fail(error)
      }
    })
  }

  const terminate = (): void => {
    terminated = true
    fail(new Error('Editor computation worker was terminated'))
  }

  return { compute, terminate }
}
