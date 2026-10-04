import { useMemo } from 'react'

import { CommonCommandShortcutMap, useCommonCommands } from '../../common/hooks/useCommonCommands'
import { useOptionalSubProject } from '../../common/hooks/useOptionalSubProject'
import { useSubProjectHistory } from '../../common/hooks/useSubProjectHistory'
import { Loadable } from '../../common/loadable'
import { isDefined } from '../../common/utils/isDefined'
import type { ElectronCommandMap } from '../schemas/electronCommands'
import type { ElectronProjectSchema } from '../schemas/electronProject'
import { useElectronProject } from './useElectronProject'

export const useElectronCommands = (): ElectronCommandMap => {
  const { electronProject } = useElectronProject()
  const { subProject } = useOptionalSubProject()
  const hasOpenSubProject = isDefined(subProject)
  const { canRedo, canUndo } = useSubProjectHistory()
  const hasProjectAndIsDirty = Loadable.get(
    Loadable.map(electronProject, (project: ElectronProjectSchema): boolean => project.isDirty),
    true,
  )
  const hasOpenProject = Loadable.get(
    Loadable.map(electronProject, (): boolean => true),
    true,
  )

  const commonCommands = useCommonCommands({
    canRedo,
    canUndo,
    hasOpenProject,
    hasOpenSubProject,
    shortcuts: COMMAND_OVERRIDES,
  })

  const commands = useMemo<ElectronCommandMap>(() => {
    return {
      // Common commands
      ...commonCommands,
      // File basics
      save: {
        id: 'save',
        disabled: !hasProjectAndIsDirty,
        shortcut: { default: ['CommandOrControl', 'S'] },
      },
      'save-as': {
        id: 'save-as',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'Shift', 'S'] },
      },
      open: {
        id: 'open',
        disabled: false,
        shortcut: { default: ['CommandOrControl', 'O'] },
      },
    } satisfies ElectronCommandMap
  }, [commonCommands, hasOpenProject, hasProjectAndIsDirty])

  return commands
}

const COMMAND_OVERRIDES: Partial<CommonCommandShortcutMap> = {
  measurement: {
    default: ['CommandOrControl', 'Shift', 'M'],
  },
  // Edit incremenets
  'increment-small': {
    default: ['CommandOrControl', 'Digit1'],
  },
  'increment-medium': {
    default: ['CommandOrControl', 'Digit2'],
  },
  'increment-stitch-hole-distance': {
    default: ['CommandOrControl', 'Digit3'],
  },
  // View
  'stitch-line-visibility': {
    default: ['CommandOrControl', 'Shift', 'L'],
  },
  'stitch-hole-visibility': {
    default: ['CommandOrControl', 'Shift', 'X'],
  },
  'stitch-hole-footprint-visibility': {
    default: ['CommandOrControl', 'Shift', 'J'],
  },
  'stitches-visibility': {
    default: ['CommandOrControl', 'Shift', 'T'],
  },
  'stitch-count-visibility': {
    default: ['CommandOrControl', 'Shift', 'Y'],
  },
  'component-dimensions-visibility': {
    default: ['CommandOrControl', 'Shift', 'D'],
  },
}
