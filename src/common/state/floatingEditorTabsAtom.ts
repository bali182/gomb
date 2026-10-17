import { atom } from 'jotai'

export const floatingEditorTabsAtom = atom<Partial<Record<string, string>>>({})
