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
import { ISSUES_URL, REPO_URL } from '../../common/constants/links'
import { CommandsContext, CommandsContextValue } from '../../common/contexts/CommandsContext'
import { useCommonCommandEmitter } from '../../common/hooks/useCommonCommandEmitter'
import { useGlobalSettings } from '../../common/hooks/useGlobalSettings'
import { useSubProjectHistory } from '../../common/hooks/useSubProjectHistory'
import { isDefined } from '../../common/utils/isDefined'
import { electronApi } from '../electronApi'
import { useElectronCommands } from '../hooks/useElectronCommands'
import { useElectronProject } from '../hooks/useElectronProject'
import { ElectronCommand, ElectronCommandIdSchema } from '../schemas/electronCommands'

export const ElectronCommandManager: FC<PropsWithChildren> = ({ children }) => {
  const [isScalingDialogOpen, setScalingDialogOpen] = useState<boolean>(false)
  const [isSvgExportDialogOpen, setSvgExportDialogOpen] = useState<boolean>(false)
  const [isPdfExportDialogOpen, setPdfExportDialogOpen] = useState<boolean>(false)
  const [isLicenseDialogOpen, setLicenseDialogOpen] = useState<boolean>(false)
  const { openProject, saveProject, saveProjectAs } = useElectronProject()
  const { setEditSettings, setViewSettings, settings } = useGlobalSettings()
  const { redo, undo } = useSubProjectHistory()

  const commands = useElectronCommands()

  const getCommand = useCallback(
    (id: ElectronCommandIdSchema): ElectronCommand => {
      const command = commands[id]
      if (!isDefined(command)) {
        throw new Error(`Unknown command: ${id}`)
      }
      return command
    },
    [commands],
  )

  const emitCommand = useCallback(
    async (id: ElectronCommandIdSchema): Promise<void> => {
      const command = getCommand(id)

      if (command.disabled === true) {
        return
      }

      switch (id) {
        case 'open':
          return openProject()
        case 'save':
          return saveProject()
        case 'save-as':
          return saveProjectAs()
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
        case 'report-issue':
          return electronApi.openExternal(ISSUES_URL)
        case 'view-license':
          return setLicenseDialogOpen(true)
        case 'view-source-code':
          return electronApi.openExternal(REPO_URL)
        default:
          console.log(`Command "${id}" not yet handled!`)
      }
    },
    [getCommand, openProject, redo, saveProject, saveProjectAs, undo, setEditSettings, setViewSettings, settings.view],
  )

  useCommonCommandEmitter({ commands, execute: emitCommand })

  const value = useMemo<CommandsContextValue<ElectronCommandIdSchema>>(
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
