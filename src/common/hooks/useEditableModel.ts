import { useCallback, useEffect, useLayoutEffect, useReducer, useState } from 'react'

import type { EditableSchema, EditableSchemaContextSchema } from '../schemas/editable'
import type { ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { isDefined } from '../utils/isDefined'
import { isReferentiallyEqual } from '../utils/isReferentiallyEqual'
import { editableModelReducer, type EditableModelState } from './editableModelReducer'
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

/**
 * Edits a model without putting incomplete form input into the project.
 * Input changes immediately. Validated project writes are throttled.
 *
 * NORMAL EDIT
 * setValue → 'edit' stores the input and sets needsCommit.
 * The processing effect sends validationResult.committedValue to the throttle
 * and dispatches 'edit-processed' to avoid scheduling the same input again.
 * The throttle keeps only the latest waiting value.
 *
 * PROJECT WRITE
 * commitLocally dispatches 'commit-sent', then calls commit.
 * sentValue identifies our own write when it returns through the value prop.
 *
 * IMMEDIATE EDIT
 * setValueImmediately queues an updater. Execution happens in the processing effect.
 * It flushes the throttle and commits any input not yet scheduled.
 * Then it runs, validates and commits each updater in order without throttling.
 * Each updater receives the previous editable and committed values.
 * 'immediate-applied' adopts the final input. Executed requests are removed.
 *
 * INCOMING PROJECT VALUE
 * The layout effect handles incoming changes before further input processing.
 * A match with sentValue dispatches 'project-acknowledged', preserving newer input.
 * Otherwise it cancels pending work and dispatches 'project-replaced' to reload input.
 * Example: our committed 11 returns while input is already 12 → input stays 12.
 * Processing waits while value differs from the already handled projectValue.
 *
 * needsCommit means “input not yet scheduled”, not “project write still pending”.
 */
export const useEditableModel = <T, C extends EditableSchemaContextSchema>({
  commit,
  context,
  validate,
  value,
  isEqual = isReferentiallyEqual,
  throttle = 0,
}: UseEditableModelOptions<T, C>): UseEditableModelResult<T> => {
  const [state, dispatch] = useReducer(
    editableModelReducer<T>,
    value,
    (initialValue: T): EditableModelState<T> => ({
      editableValue: getEditableSchema(initialValue, context),
      projectValue: initialValue,
      sentValue: undefined,
      needsCommit: false,
    }),
  )
  const [pendingUpdates, setPendingUpdates] = useState<ImmediateUpdater<T>[]>([])

  const commitLocally = useCallback(
    (committedValue: T): T => {
      dispatch({ type: 'commit-sent', value: committedValue })
      commit(committedValue)
      return committedValue
    },
    [commit],
  )

  const {
    call: throttledCommit,
    flush: flushCommit,
    cancel: cancelCommit,
  } = useThrottledCallback(commitLocally, throttle)

  const validationResult = validate(state.editableValue, isDefined(state.sentValue) ? state.sentValue : value, context)

  useLayoutEffect(() => {
    if (value === state.projectValue) {
      return
    }

    if (isEqual(value, state.sentValue)) {
      dispatch({ type: 'project-acknowledged', value })
      return
    }

    cancelCommit()
    setPendingUpdates((current: ImmediateUpdater<T>[]): ImmediateUpdater<T>[] => (current.length === 0 ? current : []))
    dispatch({ type: 'project-replaced', value, editableValue: getEditableSchema(value, context) })
  }, [cancelCommit, context, isEqual, state.projectValue, state.sentValue, value])

  useEffect(() => {
    // Wait until the project value has been acknowledged or adopted before processing the draft.
    if (value !== state.projectValue) {
      return
    }

    if (pendingUpdates.length === 0) {
      if (!state.needsCommit) {
        return
      }

      dispatch({ type: 'edit-processed', editableValue: state.editableValue })
      throttledCommit(validationResult.committedValue)
      return
    }

    let currentEditable = state.editableValue
    let currentValue = isDefined(state.sentValue) ? state.sentValue : value
    const flushedValue = flushCommit()
    if (isDefined(flushedValue)) {
      currentValue = flushedValue
    }

    if (state.needsCommit) {
      currentValue = commitLocally(validate(currentEditable, currentValue, context).committedValue)
    }

    for (const update of pendingUpdates) {
      currentEditable = update(currentEditable, currentValue)
      currentValue = commitLocally(validate(currentEditable, currentValue, context).committedValue)
    }

    dispatch({
      type: 'immediate-applied',
      sourceEditableValue: state.editableValue,
      editableValue: currentEditable,
    })
    setPendingUpdates((current: ImmediateUpdater<T>[]): ImmediateUpdater<T>[] => current.slice(pendingUpdates.length))
  }, [
    commitLocally,
    context,
    flushCommit,
    pendingUpdates,
    state,
    throttledCommit,
    validate,
    validationResult.committedValue,
    value,
  ])

  const setValue = useCallback((updatedValue: EditableSchema<T>): void => {
    dispatch({ type: 'edit', editableValue: updatedValue })
  }, [])

  const setValueImmediately = useCallback((update: ImmediateUpdater<T>): void => {
    setPendingUpdates((current: ImmediateUpdater<T>[]): ImmediateUpdater<T>[] => [...current, update])
  }, [])

  return {
    editableValue: state.editableValue,
    setValue,
    setValueImmediately,
    validationIssues: validationResult.issues,
    value,
  }
}
