import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { processEditorComputation } from '../logic/processEditorComputation'
import type {
  EditorComputationCompletedSchema,
  EditorComputationFailedSchema,
  EditorComputationRequestSchema,
} from '../schemas/editorComputation'
import { d } from '../testData'
import { deserializeEditorComputation, serializeEditorComputation } from './editorComputationSerialization'

describe('editor computation serialization', () => {
  it('preserves nested BigNumbers, precision and ordinary text', () => {
    const value = {
      number: new BigNumber('12345678901234567890.1234567890123456789'),
      values: [new BigNumber('-0.000000000000000000123'), { radius: new BigNumber(0) }],
      name: '123.456',
      empty: null,
    }
    const restored = deserializeEditorComputation<typeof value>(serializeEditorComputation(value))

    expect(restored).toEqual(value)
    expect(BigNumber.isBigNumber(restored.number)).toBe(true)
    expect(restored.number.plus(1).toFixed()).toBe('12345678901234567891.1234567890123456789')
    expect(restored.name).toBe('123.456')
    expect(restored.empty).toBeNull()
  })

  it('round-trips the complete request and completed response', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root', width: 123, height: 80 }) })
    const request: EditorComputationRequestSchema = {
      requestId: 4,
      project: d.project({ id: 'project', subProjects: [subProject] }),
      subProjectId: subProject.id,
    }
    const restoredRequest = deserializeEditorComputation<EditorComputationRequestSchema>(
      serializeEditorComputation(request),
    )
    expect(restoredRequest).toEqual(request)

    const response: EditorComputationCompletedSchema = {
      type: 'completed',
      requestId: request.requestId,
      result: processEditorComputation(restoredRequest),
    }
    const restored = deserializeEditorComputation<EditorComputationCompletedSchema>(
      serializeEditorComputation(response),
    )
    expect(restored).toEqual(response)
    expect(restored.requestId).toBe(4)
    expect(BigNumber.isBigNumber(restored.result.computedSubProject.viewBox.width)).toBe(true)
  })

  it('round-trips failed responses as failed, preserving their messages', () => {
    const response: EditorComputationFailedSchema = {
      type: 'failed',
      requestId: 5,
      error: 'Cannot calculate the selected subproject',
    }
    const restored = deserializeEditorComputation<EditorComputationFailedSchema>(serializeEditorComputation(response))
    expect(restored).toEqual(response)
  })
})
