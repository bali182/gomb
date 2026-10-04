import { useMemo } from 'react'

import { useCommonCommands } from '../../common/hooks/useCommonCommands'
import { useOptionalProject } from '../../common/hooks/useOptionalProject'
import { useOptionalSubProject } from '../../common/hooks/useOptionalSubProject'
import { useSubProjectHistory } from '../../common/hooks/useSubProjectHistory'
import { isDefined } from '../../common/utils/isDefined'
import type { WebCommandMap } from '../schemas/webCommands'

export const useWebCommands = (): WebCommandMap => {
  const { project } = useOptionalProject()
  const { subProject } = useOptionalSubProject()
  const { canRedo, canUndo } = useSubProjectHistory()
  const hasOpenProject = isDefined(project)
  const hasOpenSubProject = isDefined(subProject)
  const commonCommands = useCommonCommands({
    canRedo,
    canUndo,
    hasOpenProject,
    hasOpenSubProject,
  })

  const commands = useMemo<WebCommandMap>(() => {
    return {
      // Common commands
      ...commonCommands,
      // File basics
      'download-project': {
        id: 'download-project',
        disabled: !hasOpenProject,
        shortcut: { default: ['CommandOrControl', 'S'] },
      },
      // Help
      'download-app': {
        id: 'download-app',
        disabled: false,
      },
    } satisfies WebCommandMap
  }, [commonCommands, hasOpenProject])

  return commands
}
