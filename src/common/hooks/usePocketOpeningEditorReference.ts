import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { PocketSchema } from '../schemas/components'
import { pocketOpeningReferencesAtom } from '../state/pocketOpeningReferencesAtom'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { useSubProject } from './useSubProject'

export type UsePocketOpeningEditorReferenceResult = {
  pocket: PocketSchema | undefined
  pockets: PocketSchema[]
  setPocketReference: (pocketId: string) => void
}

export const usePocketOpeningEditorReference = (openingId: string): UsePocketOpeningEditorReferenceResult => {
  const [references, setReferences] = useAtom(pocketOpeningReferencesAtom)
  const lastUsedPocketId = references[openingId]
  const { subProject } = useSubProject()

  const accessor = useMemo(() => accessors.subProject(subProject), [subProject])

  const pockets = useMemo(
    (): PocketSchema[] => accessor.component.pockets().filter((pocket) => pocket.openingId === openingId),
    [accessor, openingId],
  )

  const pocket = useMemo((): PocketSchema | undefined => {
    // No manually selected pocket
    if (!isDefined(lastUsedPocketId)) {
      return pockets[0]
    }
    const lastUsedPocket = accessor.optional.component.pocket(lastUsedPocketId)
    // Since last selection the pocket changed its opening.
    if (lastUsedPocket?.openingId !== openingId) {
      return pockets[0]
    }
    // If the pocket still exist and points to our opening return it, otherwise chose the first from the possibly empty opening list.
    return isDefined(lastUsedPocket) ? lastUsedPocket : pockets[0]
  }, [accessor, lastUsedPocketId, openingId, pockets])

  const setPocketReference = useCallback(
    (pocketId: string) => {
      setReferences((references) => ({ ...references, [openingId]: pocketId }))
    },
    [openingId, setReferences],
  )

  return {
    pocket,
    pockets,
    setPocketReference,
  }
}
