import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useEditorContext } from '../contexts/EditorContext'
import type { SubProjectSchema } from '../schemas/subProject'
import type {
  ActiveSubProjectHistoryThrottleSchema,
  SubProjectHistoryDirectionSchema,
  SubProjectHistorySchema,
  SubProjectHistoryStateSchema,
  SubProjectHistoryThrottleKeySchema,
} from '../schemas/subProjectHistory'
import { subProjectHistoryAtom } from '../state/subProjectHistoryAtom'
import { isDefined } from '../utils/isDefined'

const MAX_HISTORY_ENTRIES = 20
const HISTORY_THROTTLE_MS = 400

export type UseSubProjectHistoryOutput = {
  canRedo: boolean
  canUndo: boolean
  recordChange: (subProject: SubProjectSchema) => void
  recordThrottledChange: (key: SubProjectHistoryThrottleKeySchema, subProject: SubProjectSchema) => void
  redo: () => void
  undo: () => void
}

export const useSubProjectHistory = (): UseSubProjectHistoryOutput => {
  const { setSubProject, subProject, isComputing, setEditingInputId } = useEditorContext()
  const [historyState, setHistoryState] = useAtom(subProjectHistoryAtom)

  const recordChange = useCallback(
    (subProject: SubProjectSchema): void => {
      setHistoryState((currentState) => recordHistorySnapshot(currentState, subProject, undefined))
    },
    [setHistoryState],
  )

  const recordThrottledChange = useCallback(
    (key: SubProjectHistoryThrottleKeySchema, subProject: SubProjectSchema): void => {
      const now = Date.now()

      setHistoryState((currentState) => {
        if (!shouldRecordThrottledUpdate(currentState.activeThrottle, key, now)) {
          return currentState
        }

        return recordHistorySnapshot(currentState, subProject, { key, lastSnapshotAt: now })
      })
    },
    [setHistoryState],
  )

  const undo = useCallback((): void => {
    if (isComputing || !isDefined(subProject)) {
      return
    }

    const targetSubProject = getHistoryTargetSubProject(historyState, subProject, 'undo')

    if (!isDefined(targetSubProject)) {
      return
    }

    setEditingInputId(undefined)
    setHistoryState((currentState) => moveHistorySnapshot(currentState, subProject, 'undo'))
    setSubProject(targetSubProject)
  }, [historyState, isComputing, setEditingInputId, setHistoryState, setSubProject, subProject])

  const redo = useCallback((): void => {
    if (isComputing || !isDefined(subProject)) {
      return
    }

    const targetSubProject = getHistoryTargetSubProject(historyState, subProject, 'redo')

    if (!isDefined(targetSubProject)) {
      return
    }

    setEditingInputId(undefined)
    setHistoryState((currentState) => moveHistorySnapshot(currentState, subProject, 'redo'))
    setSubProject(targetSubProject)
  }, [historyState, isComputing, setEditingInputId, setHistoryState, setSubProject, subProject])

  const canUndo = hasHistoryEntry(historyState, subProject?.id, 'undo')
  const canRedo = hasHistoryEntry(historyState, subProject?.id, 'redo')

  return useMemo<UseSubProjectHistoryOutput>(
    () => ({
      canRedo,
      canUndo,
      recordChange,
      recordThrottledChange,
      redo,
      undo,
    }),
    [canRedo, canUndo, recordChange, recordThrottledChange, redo, undo],
  )
}

const shouldRecordThrottledUpdate = (
  activeThrottle: ActiveSubProjectHistoryThrottleSchema | undefined,
  key: SubProjectHistoryThrottleKeySchema,
  now: number,
): boolean => {
  if (!isDefined(activeThrottle)) {
    return true
  }

  return activeThrottle.key !== key || now - activeThrottle.lastSnapshotAt >= HISTORY_THROTTLE_MS
}

const recordHistorySnapshot = (
  currentState: SubProjectHistoryStateSchema,
  subProject: SubProjectSchema,
  activeThrottle: ActiveSubProjectHistoryThrottleSchema | undefined,
): SubProjectHistoryStateSchema => {
  const currentHistory = currentState.histories.get(subProject.id) ?? { redo: [], undo: [] }
  const duplicate = currentHistory.undo[currentHistory.undo.length - 1] === subProject
  if (duplicate && currentHistory.redo.length === 0) {
    return currentState.activeThrottle === activeThrottle ? currentState : { ...currentState, activeThrottle }
  }

  const nextHistory: SubProjectHistorySchema = {
    redo: [],
    undo: duplicate ? currentHistory.undo : [...currentHistory.undo, subProject].slice(-MAX_HISTORY_ENTRIES),
  }

  return {
    activeThrottle,
    histories: new Map(currentState.histories).set(subProject.id, nextHistory),
  }
}

const moveHistorySnapshot = (
  currentState: SubProjectHistoryStateSchema,
  currentSubProject: SubProjectSchema,
  direction: SubProjectHistoryDirectionSchema,
): SubProjectHistoryStateSchema => {
  const currentHistory = currentState.histories.get(currentSubProject.id) ?? { redo: [], undo: [] }
  const source = currentHistory[direction]
  const targetDirection = direction === 'undo' ? 'redo' : 'undo'
  const target = currentHistory[targetDirection]

  if (source.length === 0) {
    return currentState
  }

  const nextHistory: SubProjectHistorySchema = {
    ...currentHistory,
    [direction]: source.slice(0, -1),
    [targetDirection]: [...target, currentSubProject].slice(-MAX_HISTORY_ENTRIES),
  }

  return {
    activeThrottle: undefined,
    histories: new Map(currentState.histories).set(currentSubProject.id, nextHistory),
  }
}

const getHistoryTargetSubProject = (
  historyState: SubProjectHistoryStateSchema,
  subProject: SubProjectSchema | undefined,
  direction: SubProjectHistoryDirectionSchema,
): SubProjectSchema | undefined => {
  if (!isDefined(subProject)) {
    return undefined
  }

  const history = historyState.histories.get(subProject.id)

  if (!isDefined(history)) {
    return undefined
  }

  return history[direction][history[direction].length - 1]
}

const hasHistoryEntry = (
  historyState: SubProjectHistoryStateSchema,
  subProjectId: string | undefined,
  direction: SubProjectHistoryDirectionSchema,
): boolean => {
  if (!isDefined(subProjectId)) {
    return false
  }

  return (historyState.histories.get(subProjectId)?.[direction].length ?? 0) > 0
}
