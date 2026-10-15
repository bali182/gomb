import { useCallback, useEffect, useRef, useState } from 'react'

import type { EditableSchema, EditableSchemaContextSchema } from '../schemas/editable'
import type { ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { isDefined } from '../utils/isDefined'
import { isReferentiallyEqual } from '../utils/isReferentiallyEqual'
import { useThrottledCallback } from './useThrottledCallback'

export type ImmediateUpdater<T> = (current: EditableSchema<T>, currentValue: T) => EditableSchema<T>

export type UseEditableModelResult<T> = {
  editableValue: EditableSchema<T>
  validationIssues: ValidationIssuesSchema<T>
  value: T
  setValue: (value: EditableSchema<T>) => void
  setValueImmediately: (update: ImmediateUpdater<T>) => void
}

type UseEditableModelOptions<T, C> = {
  context: C
  value: T
  validate: (input: EditableSchema<T>, currentValue: T, context: C) => ValidationResultSchema<T>
  commit: (value: T) => void
  isEqual?: (a: T | undefined, b: T | undefined) => boolean
  throttle?: number
}

export const useEditableModel = <T, C extends EditableSchemaContextSchema>({
  commit,
  context,
  validate,
  value,
  isEqual = isReferentiallyEqual,
  throttle = 0,
}: UseEditableModelOptions<T, C>): UseEditableModelResult<T> => {
  const [isDirty, setIsDirty] = useState(false)
  const [locallyCommittedValue, setLocallyCommittedValue] = useState<T | undefined>(undefined)
  const [lastObservedValue, setLastObservedValue] = useState(value)
  const [editableValue, setEditableValue] = useState<EditableSchema<T>>(() => getEditableSchema(value, context))
  const editableValueRef = useRef(editableValue)
  const processedEditableValueRef = useRef(editableValue)
  const committedValueRef = useRef(value)

  const commitLocally = useCallback(
    (committedValue: T): void => {
      committedValueRef.current = committedValue
      setLocallyCommittedValue(committedValue)
      commit(committedValue)
    },
    [commit],
  )
  const { call: throttledCommit, flush: flushCommit } = useThrottledCallback(commitLocally, throttle)

  const validationResult = validate(
    editableValue,
    isDefined(locallyCommittedValue) ? locallyCommittedValue : value,
    context,
  )

  useEffect(() => {
    if (value === lastObservedValue) {
      return
    }

    setLastObservedValue(value)

    if (isEqual(value, locallyCommittedValue)) {
      setLocallyCommittedValue(undefined)
      return
    }

    const updatedEditable = getEditableSchema(value, context)
    editableValueRef.current = updatedEditable
    processedEditableValueRef.current = updatedEditable
    committedValueRef.current = value
    setLocallyCommittedValue(undefined)
    setEditableValue(updatedEditable)
    setIsDirty(false)
  }, [context, isEqual, lastObservedValue, locallyCommittedValue, value])

  useEffect(() => {
    if (!isDirty || editableValue !== editableValueRef.current || editableValue === processedEditableValueRef.current) {
      return
    }

    processedEditableValueRef.current = editableValue
    throttledCommit(validate(editableValue, committedValueRef.current, context).committedValue)
  }, [context, editableValue, isDirty, throttledCommit, validate])

  const setValue = useCallback((updatedValue: EditableSchema<T>): void => {
    editableValueRef.current = updatedValue
    setEditableValue(updatedValue)
    setIsDirty(true)
  }, [])

  const setValueImmediately = useCallback(
    (update: ImmediateUpdater<T>): void => {
      flushCommit()

      // setValue may have run before its processing effect. Commit that newer input
      // after the queued commit, so the updater sees its validated fallback values too.
      const current = editableValueRef.current
      if (current !== processedEditableValueRef.current) {
        processedEditableValueRef.current = current
        commitLocally(validate(current, committedValueRef.current, context).committedValue)
      }

      const currentValue = committedValueRef.current
      const updatedValue = update(current, currentValue)
      const result = validate(updatedValue, currentValue, context)
      editableValueRef.current = updatedValue
      processedEditableValueRef.current = updatedValue
      setEditableValue(updatedValue)
      setIsDirty(false)
      commitLocally(result.committedValue)
    },
    [commitLocally, context, flushCommit, validate],
  )

  return { editableValue, setValue, setValueImmediately, validationIssues: validationResult.issues, value }
}
