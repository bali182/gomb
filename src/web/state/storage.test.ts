import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDefaultGlobalSettings } from '../../common/utils/createDefaultGlobalSettings'
import { VERSION } from '../../version'
import { readGlobalSettingsFromStorage } from './storage'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('readGlobalSettingsFromStorage', () => {
  it('loads migrated settings without writing them during read', () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify({ app: { theme: 'dark' } }))
    const removeItem = vi.fn()
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem, removeItem, setItem })

    const defaults = createDefaultGlobalSettings('light')
    const settings = readGlobalSettingsFromStorage(defaults)

    expect(settings.version).toBe(VERSION)
    expect(settings.app).toEqual({ ...defaults.app, theme: 'dark' })
    expect(settings.edit).toEqual(defaults.edit)
    expect(removeItem).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
  })
})
