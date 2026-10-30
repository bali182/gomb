import { atom } from 'jotai'

import type { EditorComputationControlSchema } from '../../common/schemas/editorComputation'

/**
 * Editor context handles computing on a worker.
 * In order to be able to await for this outside the editor context this abomination was created.
 */
export const electronComputationAtom = atom<EditorComputationControlSchema | undefined>(undefined)
