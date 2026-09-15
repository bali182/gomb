import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { LicenseDialog } from '../../common/components/LicenseDialog'
import { PdfExportDialog } from '../../common/components/PdfExportDialog'
import { ScalingDialog } from '../../common/components/ScalingDialog'
import { SvgExportDialog } from '../../common/components/SvgExportDialog'
import {
  EDITOR_MEDIUM_STEP,
  EDITOR_SMALL_STEP,
  EDITOR_STITCH_HOLE_DISTANCE_STEP,
} from '../../common/constants/commands'
import { APP_DOWNLOAD_URL, ISSUES_URL, REPO_URL } from '../../common/constants/links'
import { CommandsContext, CommandsContextValue } from '../../common/contexts/CommandsContext'
import { useCommonCommandEmitter } from '../../common/hooks/useCommonCommandEmitter'
import { useGlobalSettings } from '../../common/hooks/useGlobalSettings'
import { useOptionalProject } from '../../common/hooks/useOptionalProject'
import { useSubProjectHistory } from '../../common/hooks/useSubProjectHistory'
import { downloadFile } from '../../common/utils/downloadFile'
import { isDefined } from '../../common/utils/isDefined'
import { useWebCommands } from '../hooks/useWebCommands'
import type { WebCommandIdSchema, WebCommandSchema } from '../schemas/webCommands'

export const WebCommandManager: FC<PropsWithChildren> = ({ children }) => {
  const [isLicenseDialogOpen, setLicenseDialogOpen] = useState<boolean>(false)
  const [isScalingDialogOpen, setScalingDialogOpen] = useState<boolean>(false)
  const [isSvgExportDialogOpen, setSvgExportDialogOpen] = useState<boolean>(false)
  const [isPdfExportDialogOpen, setPdfExportDialogOpen] = useState<boolean>(false)
  const { setEditSettings, setViewSettings, settings } = useGlobalSettings()
  const { project } = useOptionalProject()
  const { redo, undo } = useSubProjectHistory()

  const commands = useWebCommands()

  const getCommand = useCallback(
    (id: WebCommandIdSchema): WebCommandSchema => {
      const command = commands[id]
      if (!isDefined(command)) {
        throw new Error(`Unknown command: ${id}`)
      }
      return command
    },
    [commands],
  )

  const emitCommand = useCallback(
    async (id: WebCommandIdSchema): Promise<void> => {
      const command = getCommand(id)

      if (command.disabled === true) {
        return
      }

      switch (id) {
        case 'export-svg':
          return setSvgExportDialogOpen(true)
        case 'export-pdf':
          return setPdfExportDialogOpen(true)
        case 'undo':
          return undo()
        case 'redo':
          return redo()
        case 'scaling':
          return setScalingDialogOpen(true)
        case 'increment-small':
          return setEditSettings({ step: EDITOR_SMALL_STEP })
        case 'increment-medium':
          return setEditSettings({ step: EDITOR_MEDIUM_STEP })
        case 'increment-stitch-hole-distance':
          return setEditSettings({ step: EDITOR_STITCH_HOLE_DISTANCE_STEP })
        case 'stitch-line-visibility':
          return setViewSettings({ stitchLinesVisible: !settings.view.stitchLinesVisible })
        case 'stitch-hole-visibility':
          return setViewSettings({ stitchHolesVisible: !settings.view.stitchHolesVisible })
        case 'stitches-visibility':
          return setViewSettings({ stitchesVisible: !settings.view.stitchesVisible })
        case 'stitch-count-visibility':
          return setViewSettings({ stitchCountVisible: !settings.view.stitchCountVisible })
        case 'report-issue':
          window.open(ISSUES_URL, '_blank', 'noopener,noreferrer')
          return
        case 'view-license':
          return setLicenseDialogOpen(true)
        case 'view-source-code':
          window.open(REPO_URL, '_blank', 'noopener,noreferrer')
          return
        case 'download-app':
          window.open(APP_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
          return
        case 'download-project': {
          if (!isDefined(project)) {
            throw new Error(`Cannot download project.`)
          }
          return downloadFile({
            content: JSON.stringify(project, null, 2),
            contentType: 'application/json',
            fileName: `${project.name}.json`,
          })
        }
        default: {
          console.log(`Command "${id}" not yet handled!`)
        }
      }
    },
    [getCommand, project, redo, setEditSettings, setViewSettings, settings.view, undo],
  )

  useCommonCommandEmitter({ commands, execute: emitCommand })

  const value = useMemo<CommandsContextValue<WebCommandIdSchema>>(
    () => ({ emitCommand, getCommand }),
    [emitCommand, getCommand],
  )

  return (
    <CommandsContext.Provider value={value as CommandsContextValue<string>}>
      {children}
      {!commands['export-svg'].disabled && (
        <SvgExportDialog isOpen={isSvgExportDialogOpen} onOpenChange={setSvgExportDialogOpen} />
      )}
      {!commands['export-pdf'].disabled && (
        <PdfExportDialog isOpen={isPdfExportDialogOpen} onOpenChange={setPdfExportDialogOpen} />
      )}
      {!commands['scaling'].disabled && (
        <ScalingDialog isOpen={isScalingDialogOpen} onOpenChange={setScalingDialogOpen} />
      )}
      {!commands['view-license'].disabled && (
        <LicenseDialog isOpen={isLicenseDialogOpen} onOpenChange={setLicenseDialogOpen} />
      )}
    </CommandsContext.Provider>
  )
}
