import { atom } from 'jotai'

// Stores at runtime which pocket was last targeted by the pocket opening editor.
// Is used through usePocketOpeningEditorReference, as it also checks if the pocket still exist.
// Maps pocket opening id -> to pocket id
export const pocketOpeningReferencesAtom = atom<Partial<Record<string, string>>>({})
