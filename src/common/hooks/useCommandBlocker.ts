import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { commandBlockersAtom } from '../state/commandBlockersAtom'

type UseCommandBlockerResult = {
  block: (id: string) => void
  unblock: (id: string) => void
}

export const useCommandBlocker = (): UseCommandBlockerResult => {
  const setCommandBlockers = useSetAtom(commandBlockersAtom)

  const block = useCallback(
    (id: string): void => {
      setCommandBlockers((blockers) => {
        if (blockers.has(id)) {
          return blockers
        }
        return new Set(blockers).add(id)
      })
    },
    [setCommandBlockers],
  )

  const unblock = useCallback(
    (id: string): void => {
      setCommandBlockers((blockers) => {
        if (!blockers.has(id)) {
          return blockers
        }
        const remainingBlockers = new Set(blockers)
        remainingBlockers.delete(id)
        return remainingBlockers
      })
    },
    [setCommandBlockers],
  )

  return useMemo<UseCommandBlockerResult>(() => ({ block, unblock }), [block, unblock])
}
