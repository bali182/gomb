import { atom } from 'jotai'
import type { RootPanelFaceSideSchema } from '../schemas/components'

export const rootPanelFaceSidesAtom = atom<Record<string, Record<string, RootPanelFaceSideSchema>>>({})
