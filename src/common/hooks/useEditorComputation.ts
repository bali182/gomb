import { useCallback, useEffect, useLayoutEffect, useRef, useState, type SetStateAction } from 'react'

import { Loadable } from '../loadable'
import type {
  EditorComputationControlSchema,
  EditorComputationRequestSchema,
  EditorComputationResultSchema,
  EditorComputationStateSchema,
} from '../schemas/editorComputation'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { createEditorComputationWorker } from '../workers/createEditorComputationWorker'

type UseEditorComputationOptions = {
  project: ProjectSchema | undefined
  subProjectId: string | undefined
}

type UseEditorComputationOutput = EditorComputationControlSchema & {
  state: EditorComputationStateSchema
  retryComputation: () => void
  setProject: (update: SetStateAction<ProjectSchema>) => number
  setSubProject: (update: SetStateAction<SubProjectSchema>) => number
}

type ComputationWaiter = {
  resolve: (result: EditorComputationResultSchema) => void
  reject: (error: unknown) => void
}

type ComputationRuntime = {
  sourceProject: ProjectSchema | undefined
  subProjectId: string | undefined
  requestId: number
  running: EditorComputationRequestSchema | undefined
  pending: EditorComputationRequestSchema | undefined
  failedRequest: EditorComputationRequestSchema | undefined
  lastResult: EditorComputationResultSchema | undefined
  error: unknown
  worker: ReturnType<typeof createEditorComputationWorker> | undefined
  waiters: ComputationWaiter[]
}

export const useEditorComputation = ({
  project,
  subProjectId,
}: UseEditorComputationOptions): UseEditorComputationOutput => {
  const [state, setState] = useState<EditorComputationStateSchema>({
    requestId: 0,
    result: Loadable.uninitialized(),
  })

  const runtimeRef = useRef<ComputationRuntime>({
    sourceProject: undefined,
    subProjectId: undefined,
    requestId: 0,
    running: undefined,
    pending: undefined,
    failedRequest: undefined,
    lastResult: undefined,
    error: undefined,
    worker: undefined,
    waiters: [],
  })

  const cancel = useCallback((): void => {
    const runtime = runtimeRef.current
    runtime.worker?.terminate()
    runtime.worker = undefined
    runtime.running = undefined
    runtime.pending = undefined
    const waiters = runtime.waiters
    runtime.waiters = []
    for (const waiter of waiters) {
      waiter.reject(new Error('Editor computation was cancelled'))
    }
  }, [])

  const run = useCallback(async (request: EditorComputationRequestSchema): Promise<void> => {
    const runtime = runtimeRef.current
    const worker = runtime.worker
    if (!isDefined(worker)) {
      runtime.pending = request
      return
    }
    let current = request
    while (runtime.worker === worker) {
      runtime.running = current
      try {
        const result = await worker.compute(
          current,
          (requestId: number): boolean => runtime.worker === worker && runtime.requestId === requestId,
        )
        if (runtime.worker !== worker) {
          return
        }
        if (isDefined(result) && current.requestId === runtime.requestId) {
          runtime.lastResult = result
          runtime.error = undefined
          setState({ requestId: current.requestId, result: Loadable.loaded(result) })
          const waiters = runtime.waiters
          runtime.waiters = []
          for (const waiter of waiters) {
            waiter.resolve(result)
          }
        }
      } catch (error) {
        if (runtime.worker !== worker) {
          return
        }
        if (current.requestId === runtime.requestId) {
          runtime.failedRequest = current
          runtime.error = error
          setState({
            requestId: current.requestId,
            result: isDefined(runtime.lastResult)
              ? Loadable.failedWith(runtime.lastResult, error)
              : Loadable.failed(error),
          })
          const waiters = runtime.waiters
          runtime.waiters = []
          for (const waiter of waiters) {
            waiter.reject(error)
          }
        }
      }
      runtime.running = undefined
      const next = runtime.pending
      runtime.pending = undefined
      if (!isDefined(next)) {
        return
      }
      current = next
    }
  }, [])

  const enqueue = useCallback(
    (nextProject: ProjectSchema, selectedSubProjectId: string): number => {
      const runtime = runtimeRef.current
      const request: EditorComputationRequestSchema = {
        requestId: ++runtime.requestId,
        project: nextProject,
        subProjectId: selectedSubProjectId,
      }
      runtime.error = undefined
      runtime.failedRequest = undefined
      const lastResult = runtime.lastResult
      setState((current) => {
        if (
          (current.result.type === 'loading' && !isDefined(lastResult)) ||
          (current.result.type === 'loading-with-value' && current.result.data === lastResult)
        ) {
          return current
        }
        return {
          requestId: request.requestId,
          result: isDefined(lastResult) ? Loadable.loadingWith(lastResult) : Loadable.loading(),
        }
      })
      if (isDefined(runtime.running)) {
        runtime.pending = request
      } else {
        void run(request)
      }
      return request.requestId
    },
    [run],
  )

  const retryComputation = useCallback((): void => {
    const failedRequest = runtimeRef.current.failedRequest
    if (!isDefined(failedRequest)) {
      return
    }
    enqueue(failedRequest.project, failedRequest.subProjectId)
  }, [enqueue])

  useLayoutEffect(() => {
    const runtime = runtimeRef.current
    const sourceChanged =
      project !== runtime.sourceProject && (!isDefined(project) || project !== runtime.lastResult?.project)
    const selectionChanged = subProjectId !== runtime.subProjectId
    runtime.sourceProject = project
    runtime.subProjectId = subProjectId

    if (sourceChanged || selectionChanged) {
      runtime.failedRequest = undefined
    }

    if (sourceChanged) {
      cancel()
      runtime.lastResult = undefined
      runtime.error = undefined
    }
    const currentProject =
      runtime.pending?.project ?? runtime.running?.project ?? runtime.lastResult?.project ?? project
    if (selectionChanged) {
      runtime.lastResult = undefined
    }
    if (!sourceChanged && !selectionChanged) {
      return
    }
    if (
      isDefined(currentProject) &&
      isDefined(subProjectId) &&
      isDefined(accessors.project(currentProject).optional.subProject(subProjectId))
    ) {
      if (!isDefined(runtime.worker)) {
        runtime.worker = createEditorComputationWorker()
      }
      enqueue(currentProject, subProjectId)
    } else {
      cancel()
      runtime.lastResult = undefined
      setState({ requestId: runtime.requestId, result: Loadable.uninitialized() })
    }
  }, [cancel, enqueue, project, subProjectId])

  useEffect(() => {
    const runtime = runtimeRef.current

    if (!isDefined(runtime.worker)) {
      runtime.worker = createEditorComputationWorker()
    }
    const pending = runtime.pending
    runtime.pending = undefined
    if (isDefined(pending)) {
      void run(pending)
    }

    return () => {
      const interrupted = runtime.pending ?? runtime.running
      cancel()
      runtime.pending = interrupted
    }
  }, [cancel, run])

  const setProject = useCallback(
    (update: SetStateAction<ProjectSchema>): number => {
      const runtime = runtimeRef.current
      const currentProject =
        runtime.pending?.project ?? runtime.running?.project ?? runtime.lastResult?.project ?? runtime.sourceProject
      const selectedSubProjectId = runtime.subProjectId
      if (!isDefined(currentProject) || !isDefined(selectedSubProjectId)) {
        throw new Error('Editor computation requires a project and selected subproject')
      }
      const updated = typeof update === 'function' ? update(currentProject) : update
      if (updated.id !== currentProject.id) {
        throw new Error('The selected project ID cannot be changed')
      }
      accessors.project(updated).subProject(selectedSubProjectId)
      return enqueue(updated, selectedSubProjectId)
    },
    [enqueue],
  )

  const setSubProject = useCallback(
    (update: SetStateAction<SubProjectSchema>): number => {
      const selectedSubProjectId = runtimeRef.current.subProjectId
      if (!isDefined(selectedSubProjectId)) {
        throw new Error('No subproject is selected')
      }
      return setProject((currentProject: ProjectSchema): ProjectSchema => {
        const currentSubProject = accessors.project(currentProject).subProject(selectedSubProjectId)
        const updated = typeof update === 'function' ? update(currentSubProject) : update
        if (updated.id !== selectedSubProjectId) {
          throw new Error('The selected subproject ID cannot be changed')
        }
        return {
          ...currentProject,
          subProjects: currentProject.subProjects.map((candidate) =>
            candidate.id === selectedSubProjectId ? updated : candidate,
          ),
        }
      })
    },
    [setProject],
  )

  const getRequestId = useCallback((): number => runtimeRef.current.requestId, [])

  const waitUntilIdle = useCallback((): Promise<EditorComputationResultSchema> => {
    const runtime = runtimeRef.current
    if (isDefined(runtime.running) || isDefined(runtime.pending)) {
      return new Promise((resolve, reject) => {
        runtime.waiters.push({ resolve, reject })
      })
    }
    if (isDefined(runtime.error)) {
      return Promise.reject(runtime.error)
    }
    if (isDefined(runtime.lastResult)) {
      return Promise.resolve(runtime.lastResult)
    }
    return Promise.reject(new Error('No completed editor computation is available'))
  }, [])

  return { state, retryComputation, setProject, setSubProject, getRequestId, waitUntilIdle }
}
