import { useMemo } from 'react'

import type { CommandSchema, CommonCommandIdSchema } from '../../common/schemas/command'

export type UseCommonCommandsParams = {
  canRedo: boolean
  canUndo: boolean
  hasOpenProject: boolean
}

type CommonCommandsMap = Record<CommonCommandIdSchema, CommandSchema<CommonCommandIdSchema>>

export const useCommonCommands = ({ canRedo, canUndo, hasOpenProject }: UseCommonCommandsParams): CommonCommandsMap => {
  const commands = useMemo<CommonCommandsMap>(() => {
    return {
      // File - Exports
      'export-pdf': {
        id: 'export-pdf',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'P'] },
      },
      'export-svg': {
        id: 'export-svg',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'E'] },
      },
      // Edit - Undo/Redo
      undo: {
        id: 'undo',
        disabled: !canUndo,
        shortcut: { default: ['CommandOrControl', 'Z'] },
      },
      redo: {
        id: 'redo',
        disabled: !canRedo,
        shortcut: {
          default: ['Control', 'Y'],
          mac: ['Command', 'Shift', 'Z'],
        },
      },
      // Edit - Change increments
      'increment-small': {
        id: 'increment-small',
        disabled: !hasOpenProject,
        shortcut: {
          default: ['CommandOrControl', 'Shift', 'Digit1'],
          mac: ['Command', 'Alt', 'Digit1'],
        },
      },
      'increment-medium': {
        id: 'increment-medium',
        disabled: !hasOpenProject,
        shortcut: {
          default: ['CommandOrControl', 'Shift', 'Digit2'],
          mac: ['Command', 'Alt', 'Digit2'],
        },
      },
      'increment-stitch-hole-distance': {
        id: 'increment-stitch-hole-distance',
        disabled: !hasOpenProject,
        shortcut: {
          default: ['CommandOrControl', 'Shift', 'Digit3'],
          mac: ['Command', 'Alt', 'Digit3'],
        },
      },
      // View - stitch part visibility
      'stitch-line-visibility': {
        id: 'stitch-line-visibility',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'L'] },
      },
      'stitch-hole-visibility': {
        id: 'stitch-hole-visibility',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'F'] },
      },
      'stitches-visibility': {
        id: 'stitches-visibility',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'U'] },
      },
      'stitch-count-visibility': {
        id: 'stitch-count-visibility',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'X'] },
      },
      // View scaling
      scaling: {
        id: 'scaling',
        disabled: false,
        shortcut: { default: ['CommandOrControl', 'Shift', 'V'] },
      },
    } satisfies CommonCommandsMap
  }, [canRedo, canUndo, hasOpenProject])

  return commands
}
