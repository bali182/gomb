import { Alert, Box, CloseButton } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'

import { LANGUAGE } from '../constants/language'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useProject } from '../hooks/useProject'
import { useSvgDrawArea } from '../hooks/useSvgDrawArea'
import { useTranslation } from '../hooks/useTranslation'
import { exportPdf } from '../logic/exports/exportPdf'
import type { EditableSchema } from '../schemas/editable'
import type { PdfExportSettingsSchema, PdfExportUnsuccessfulLayoutSchema } from '../schemas/pdfExport'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { hasValidationErrors } from '../utils/hasValidationErrors'
import { isDefined } from '../utils/isDefined'
import { validatePdfExportSettingsSchema } from '../validators/validatePdfExportSettingsSchema'
import { EditDialog } from './EditDialog'
import { PdfExportEditor } from './pdf-export/PdfExportEditor'

type PdfExportDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type PdfExportUnplaceableFailure = {
  type: 'unplaceable'
  layout: PdfExportUnsuccessfulLayoutSchema
}

type PdfExportRuntimeFailure = {
  type: 'runtime'
}

type PdfExportFailure = PdfExportUnplaceableFailure | PdfExportRuntimeFailure

export const PdfExportDialog: FC<PdfExportDialogProps> = ({ isOpen, onOpenChange }) => {
  const { project } = useProject()
  const { setPdfExportSettings, settings } = useGlobalSettings()
  const [exportParams, setExportParams] = useState<PdfExportSettingsSchema>(settings.pdfExport)
  const drawAreaContextValue = useSvgDrawArea(project.stitchingSettings, exportParams)
  const [localPdfExportSettings, setLocalPdfExportSettings] = useState<EditableSchema<PdfExportSettingsSchema>>(() =>
    getEditableSchema(settings.pdfExport, { language: LANGUAGE }),
  )
  const [failure, setFailure] = useState<PdfExportFailure | undefined>(undefined)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const { t } = useTranslation()
  const context = useMemo<BaseValidationContextSchema>(() => ({ language: LANGUAGE, t: t.validation }), [t.validation])

  const validationResult = useMemo(
    () => validatePdfExportSettingsSchema(localPdfExportSettings, exportParams, context),
    [context, localPdfExportSettings, exportParams],
  )

  const hasErrors = useMemo(
    () => hasValidationErrors<PdfExportSettingsSchema>(validationResult.issues),
    [validationResult.issues],
  )

  const resetDraft = useCallback((): void => {
    setLocalPdfExportSettings(getEditableSchema(settings.pdfExport, context))
    setExportParams(settings.pdfExport)
    setFailure(undefined)
  }, [context, settings.pdfExport])

  const handleParamsChange = useCallback(
    (updatedEditableParams: EditableSchema<PdfExportSettingsSchema>): void => {
      const updatedValidationResult = validatePdfExportSettingsSchema(updatedEditableParams, exportParams, context)

      setLocalPdfExportSettings(updatedEditableParams)
      setExportParams(updatedValidationResult.committedValue)
    },
    [context, exportParams],
  )

  const handleFailureDismiss = useCallback((): void => {
    setFailure(undefined)
  }, [])

  const handleSubmit = useCallback(async (): Promise<void> => {
    const submitValidationResult = validatePdfExportSettingsSchema(localPdfExportSettings, exportParams, context)

    if (!submitValidationResult.isValid) {
      return
    }

    setIsExporting(true)

    try {
      const layout = await exportPdf(project, submitValidationResult.value, drawAreaContextValue)

      if (layout.type === 'unsuccessful-pdf-export') {
        setFailure({ layout, type: 'unplaceable' })
        return
      }

      setPdfExportSettings(submitValidationResult.value)
      onOpenChange(false)
    } catch (error) {
      console.error('Unable to export PDF:', error)
      setFailure({ type: 'runtime' })
    } finally {
      setIsExporting(false)
    }
  }, [context, drawAreaContextValue, localPdfExportSettings, exportParams, onOpenChange, project, setPdfExportSettings])

  return (
    <EditDialog
      canSubmit={!hasErrors && !isExporting}
      isOpen={isOpen}
      loading={isExporting}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      submit={t.dialogs.pdfExport.positiveAction}
      title={t.dialogs.pdfExport.title}
    >
      <PdfExportFailureAlert failure={failure} onDismiss={handleFailureDismiss} />
      <PdfExportEditor
        editable={localPdfExportSettings}
        issues={validationResult.issues}
        onChange={handleParamsChange}
      />
    </EditDialog>
  )
}

type PdfExportFailureAlertProps = {
  failure: PdfExportFailure | undefined
  onDismiss: () => void
}

const PdfExportFailureAlert: FC<PdfExportFailureAlertProps> = ({ failure, onDismiss }) => {
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
              ? t.dialogs.pdfExport.errors.unplaceablePanels
              : t.dialogs.pdfExport.errors.exportFailed}
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
