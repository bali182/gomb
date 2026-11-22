import { atom } from 'jotai'

export const commandBlockersAtom = atom<ReadonlySet<string>>(new Set<string>())
