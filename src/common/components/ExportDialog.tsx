import { Alert, Box, CloseButton } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'

import { LANGUAGE } from '../constants/language'
import { useExportDrawArea } from '../hooks/useExportDrawArea'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useProject } from '../hooks/useProject'
import { useTranslation } from '../hooks/useTranslation'
import { exportProject } from '../logic/exports/exportProject'
import type { EditableSchema } from '../schemas/editable'
import type { ExportUnsuccessfulLayoutSchema } from '../schemas/export'
import type { ExportSettingsSchema } from '../schemas/settings'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { hasValidationErrors } from '../utils/hasValidationErrors'
import { isDefined } from '../utils/isDefined'
import { validateExportSettingsSchema } from '../validators/validateExportSettingsSchema'
import { EditDialog } from './EditDialog'
import { ExportEditor } from './export/ExportEditor'

type ExportDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type ExportUnplaceableFailure = {
  type: 'unplaceable'
  layout: ExportUnsuccessfulLayoutSchema
}

type ExportRuntimeFailure = {
  type: 'runtime'
}

type ExportFailure = ExportUnplaceableFailure | ExportRuntimeFailure

export const ExportDialog: FC<ExportDialogProps> = ({ isOpen, onOpenChange }) => {
  const { project } = useProject()
  const { setExportSettings, settings } = useGlobalSettings()
  const [exportParams, setExportParams] = useState<ExportSettingsSchema>(settings.export)
  const drawAreaContextValue = useExportDrawArea(project.stitchingSettings, exportParams)
  const [localExportSettings, setLocalExportSettings] = useState<EditableSchema<ExportSettingsSchema>>(() =>
    getEditableSchema(settings.export, { language: LANGUAGE }),
  )
  const [failure, setFailure] = useState<ExportFailure | undefined>(undefined)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const { t } = useTranslation()
  const context = useMemo<BaseValidationContextSchema>(() => ({ language: LANGUAGE, t: t.validation }), [t.validation])

  const validationResult = useMemo<ValidationResultSchema<ExportSettingsSchema>>(
    () => validateExportSettingsSchema(localExportSettings, exportParams, context),
    [context, localExportSettings, exportParams],
  )

  const hasErrors = useMemo<boolean>(
    () => hasValidationErrors<ExportSettingsSchema>(validationResult.issues),
    [validationResult.issues],
  )

  const resetDraft = useCallback((): void => {
    setLocalExportSettings(getEditableSchema(settings.export, context))
    setExportParams(settings.export)
    setFailure(undefined)
  }, [context, settings.export])

  const handleParamsChange = useCallback(
    (updatedEditableParams: EditableSchema<ExportSettingsSchema>): void => {
      const updatedValidationResult = validateExportSettingsSchema(updatedEditableParams, exportParams, context)

      setLocalExportSettings(updatedEditableParams)
      setExportParams(updatedValidationResult.committedValue)
    },
    [context, exportParams],
  )

  const handleFailureDismiss = useCallback((): void => {
    setFailure(undefined)
  }, [])

  const handleSubmit = useCallback(async (): Promise<void> => {
    const submitValidationResult = validateExportSettingsSchema(localExportSettings, exportParams, context)

    if (!submitValidationResult.isValid) {
      return
    }

    setIsExporting(true)

    try {
      const layout = await exportProject({
        project,
        settings: submitValidationResult.value,
        context: drawAreaContextValue,
        translation: t,
      })

      if (layout.type === 'unsuccessful-export') {
        setFailure({ layout, type: 'unplaceable' })
        return
      }

      setExportSettings(submitValidationResult.value)
      onOpenChange(false)
    } catch (error) {
      console.error('Unable to export project:', error)
      setFailure({ type: 'runtime' })
    } finally {
      setIsExporting(false)
    }
  }, [context, drawAreaContextValue, localExportSettings, exportParams, onOpenChange, project, setExportSettings, t])

  return (
    <EditDialog
      canSubmit={!hasErrors && !isExporting}
      isOpen={isOpen}
      loading={isExporting}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      submit={t.dialogs.export.positiveAction}
      title={t.dialogs.export.title}
    >
      <ExportFailureAlert failure={failure} onDismiss={handleFailureDismiss} />
      <ExportEditor editable={localExportSettings} issues={validationResult.issues} onChange={handleParamsChange} />
    </EditDialog>
  )
}

type ExportFailureAlertProps = {
  failure: ExportFailure | undefined
  onDismiss: () => void
}

const ExportFailureAlert: FC<ExportFailureAlertProps> = ({ failure, onDismiss }) => {
  const { t } = useTranslation()

  if (!isDefined(failure)) {
    return null
  }

  return (
    <Box pb="3" pt="3" px="4">
      <Alert.Root position="relative" status="error">
        <Alert.Indicator />
        <Alert.Content pe="8">
          <Alert.Title>
            {failure.type === 'unplaceable'
              ? t.dialogs.export.errors.unplaceablePanels
              : t.dialogs.export.errors.exportFailed}
          </Alert.Title>
          {failure.type === 'unplaceable' && (
            <Alert.Description as="ul" mt="2" ps="4">
              {failure.layout.unplaceables.map((panel) => {
                const root = panel.subProject.components[panel.subProject.root]
                const text = isDefined(root) ? `${root.name} → ${panel.component.name}` : panel.component.name
                return <li key={`${panel.subProject.id}:${panel.component.id}`}>{text}</li>
              })}
            </Alert.Description>
          )}
        </Alert.Content>
        <CloseButton onClick={onDismiss} position="absolute" size="sm" top="2" insetEnd="2" />
      </Alert.Root>
    </Box>
  )
}
