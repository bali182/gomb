import { useMemo } from 'react'

import type { CommandSchema, CommandShortcutSchema, CommonCommandIdSchema } from '../../common/schemas/command'
import { has } from '../utils/has'

export type CommonCommandShortcutMap = Record<CommonCommandIdSchema, CommandShortcutSchema | undefined>

export type UseCommonCommandsParams = {
  canRedo: boolean
  canUndo: boolean
  hasOpenProject: boolean
  shortcuts?: Partial<CommonCommandShortcutMap>
}

type CommonCommandsMap = Record<CommonCommandIdSchema, CommandSchema<CommonCommandIdSchema>>

export const useCommonCommands = ({
  canRedo,
  canUndo,
  hasOpenProject,
  shortcuts,
}: UseCommonCommandsParams): CommonCommandsMap => {
  const commands = useMemo<CommonCommandsMap>(() => {
    const getShortcut = createShortcutGetter(DEFAULT_SHORTCUTS, shortcuts)
    return {
      // File - Exports
      'export-pdf': {
        id: 'export-pdf',
        disabled: !hasOpenProject,
        shortcut: getShortcut('export-pdf'),
      },
      'export-svg': {
        id: 'export-svg',
        disabled: !hasOpenProject,
        shortcut: getShortcut('export-svg'),
      },
      // Edit - Undo/Redo
      undo: {
        id: 'undo',
        disabled: !canUndo,
        shortcut: getShortcut('undo'),
      },
      redo: {
        id: 'redo',
        disabled: !canRedo,
        shortcut: getShortcut('redo'),
      },
      // Edit - Change increments
      'increment-small': {
        id: 'increment-small',
        disabled: !hasOpenProject,
        shortcut: getShortcut('increment-small'),
      },
      'increment-medium': {
        id: 'increment-medium',
        disabled: !hasOpenProject,
        shortcut: getShortcut('increment-medium'),
      },
      'increment-stitch-hole-distance': {
        id: 'increment-stitch-hole-distance',
        disabled: !hasOpenProject,
        shortcut: getShortcut('increment-stitch-hole-distance'),
      },
      // View - component visibility
      'component-dimensions-visibility': {
        id: 'component-dimensions-visibility',
        disabled: !hasOpenProject,
        shortcut: getShortcut('component-dimensions-visibility'),
      },
      // View - stitch part visibility
      'stitch-line-visibility': {
        id: 'stitch-line-visibility',
        disabled: !hasOpenProject,
        shortcut: getShortcut('stitch-line-visibility'),
      },
      'stitch-hole-visibility': {
        id: 'stitch-hole-visibility',
        disabled: !hasOpenProject,
        shortcut: getShortcut('stitch-hole-visibility'),
      },
      'stitches-visibility': {
        id: 'stitches-visibility',
        disabled: !hasOpenProject,
        shortcut: getShortcut('stitches-visibility'),
      },
      'stitch-count-visibility': {
        id: 'stitch-count-visibility',
        disabled: !hasOpenProject,
        shortcut: getShortcut('stitch-count-visibility'),
      },
      // View scaling
      scaling: {
        id: 'scaling',
        disabled: false,
        shortcut: getShortcut('scaling'),
      },
      // Help
      'view-source-code': {
        id: 'view-source-code',
        disabled: false,
        shortcut: getShortcut('view-source-code'),
      },
      'report-issue': {
        id: 'report-issue',
        disabled: false,
        shortcut: getShortcut('report-issue'),
      },
      'view-license': {
        id: 'view-license',
        disabled: false,
        shortcut: getShortcut('view-license'),
      },
    } satisfies CommonCommandsMap
  }, [canRedo, canUndo, hasOpenProject, shortcuts])

  return commands
}

const createShortcutGetter =
  (defaults: CommonCommandShortcutMap, overrides: Partial<CommonCommandShortcutMap> = {}) =>
  (key: CommonCommandIdSchema): CommandShortcutSchema | undefined => {
    return has(overrides, key) ? overrides[key] : defaults[key]
  }

const DEFAULT_SHORTCUTS: CommonCommandShortcutMap = {
  'export-pdf': {
    default: ['CommandOrControl', 'Shift', 'P'],
  },
  'export-svg': {
    default: ['CommandOrControl', 'Shift', 'E'],
  },
  undo: {
    default: ['CommandOrControl', 'Z'],
  },
  redo: {
    default: ['Control', 'Y'],
    mac: ['Command', 'Shift', 'Z'],
  },
  'increment-small': {
    default: ['CommandOrControl', 'Shift', 'Digit1'],
    mac: ['Command', 'Alt', 'Digit1'],
  },
  'increment-medium': {
    default: ['CommandOrControl', 'Shift', 'Digit2'],
    mac: ['Command', 'Alt', 'Digit2'],
  },
  'increment-stitch-hole-distance': {
    default: ['CommandOrControl', 'Shift', 'Digit3'],
    mac: ['Command', 'Alt', 'Digit3'],
  },
  'component-dimensions-visibility': undefined,
  'stitch-line-visibility': undefined,
  'stitch-hole-visibility': undefined,
  'stitches-visibility': undefined,
  'stitch-count-visibility': undefined,
  scaling: {
    default: ['CommandOrControl', 'Shift', 'V'],
  },
  'view-source-code': undefined,
  'report-issue': undefined,
  'view-license': undefined,
}
