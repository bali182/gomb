import { atom } from 'jotai'
import type { SetStateAction } from 'react'

import type { GlobalSettingsSchema } from '../../common/schemas/settings'
import { createDefaultGlobalSettings } from '../../common/utils/createDefaultGlobalSettings'
import { getSystemTheme } from '../../common/utils/getSystemTheme'
import { getWebDefaultLanguage } from '../../common/utils/getWebDefaultLanguage'
import { readGlobalSettingsFromStorage, saveGlobalSettingsToStorage } from './storage'

const globalSettingsStorageAtom = atom<GlobalSettingsSchema>(
  readGlobalSettingsFromStorage(
    createDefaultGlobalSettings({ language: getWebDefaultLanguage(), theme: getSystemTheme() }),
  ),
)

export const globalSettingsAtom = atom(
  (get): GlobalSettingsSchema => get(globalSettingsStorageAtom),
  (get, set, update: SetStateAction<GlobalSettingsSchema>): void => {
    const currentSettings = get(globalSettingsStorageAtom)
    const nextSettings = typeof update === 'function' ? update(currentSettings) : update

    set(globalSettingsStorageAtom, nextSettings)
    saveGlobalSettingsToStorage(nextSettings)
  },
)
