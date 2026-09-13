import type { CommandSchema } from '../../common/schemas/command'

type NativeElectronCommandIdSchema = 'copy' | 'paste' | 'cut' | 'close-window' | 'quit' | 'devtools' | 'select-all'

type NativeElectronCommand = CommandSchema<NativeElectronCommandIdSchema>

export const nativeElectronCommands: NativeElectronCommand[] = [
  {
    id: 'copy',
    shortcut: { default: ['CommandOrControl', 'C'] },
  },
  {
    id: 'paste',
    shortcut: { default: ['CommandOrControl', 'V'] },
  },
  {
    id: 'cut',
    shortcut: { default: ['CommandOrControl', 'X'] },
  },
  {
    id: 'close-window',
    shortcut: { default: ['CommandOrControl', 'W'] },
  },
  {
    id: 'quit',
    shortcut: { default: ['CommandOrControl', 'Q'] },
  },
  {
    id: 'devtools',
    shortcut: { default: ['CommandOrControl', 'Alt', 'KeyI'] },
  },
  {
    id: 'select-all',
    shortcut: { default: ['CommandOrControl', 'A'] },
  },
]
