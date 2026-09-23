import { useCallback, useEffect, useState } from 'react'

import type { EditableSchema, EditableSchemaContextSchema } from '../schemas/editable'
import type { ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { isReferentiallyEqual } from '../utils/isReferentiallyEqual'
import { useThrottledCallback } from './useThrottledCallback'

export type UseEditableModelResult<T> = {
  editableValue: EditableSchema<T>
  validationIssues: ValidationIssuesSchema<T>
  value: T
  setValue: (value: EditableSchema<T>) => void
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
  const [processedEditableValue, setProcessedEditableValue] = useState<EditableSchema<T> | undefined>(undefined)

  const commitLocally = useCallback(
    (committedValue: T): void => {
      setLocallyCommittedValue(committedValue)
      commit(committedValue)
    },
    [commit],
  )
  const throttledCommit = useThrottledCallback(commitLocally, throttle)

  const validationResult = validate(editableValue, value, context)

  useEffect(() => {
    if (value === lastObservedValue) {
      return
    }

    setLastObservedValue(value)

    if (isEqual(value, locallyCommittedValue)) {
      setLocallyCommittedValue(undefined)
      return
    }

    setEditableValue(getEditableSchema(value, context))
    setIsDirty(false)
  }, [context, isEqual, lastObservedValue, locallyCommittedValue, value])

  useEffect(() => {
    if (!isDirty || editableValue === processedEditableValue) {
      return
    }

    setProcessedEditableValue(editableValue)
    throttledCommit(validationResult.committedValue)
  }, [editableValue, isDirty, processedEditableValue, throttledCommit, validationResult])

  const setValue = useCallback((updatedValue: EditableSchema<T>): void => {
    setEditableValue(updatedValue)
    setIsDirty(true)
  }, [])

  return { editableValue, setValue, validationIssues: validationResult.issues, value }
}
