import { Box, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState, type FC } from 'react'

import { EXPORT_PREVIEW_BORDER_WIDTH, EXPORT_PREVIEW_PADDING, EXPORT_PREVIEW_WIDTH } from '../constants/exportPreview'
import { LANGUAGE } from '../constants/language'
import { useExportProject } from '../hooks/useExportProject'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useProject } from '../hooks/useProject'
import { useTranslation } from '../hooks/useTranslation'
import type { EditableSchema } from '../schemas/editable'
import type { ExportSettingsSchema } from '../schemas/settings'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateExportSettingsSchema } from '../validators/validateExportSettingsSchema'
import { EditDialog } from './EditDialog'
import { ExportEditor } from './export/ExportEditor'
import { ExportPreview } from './export/ExportPreview'

type ExportDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ExportDialog: FC<ExportDialogProps> = ({ isOpen, onOpenChange }) => {
  const { project } = useProject()
  const { setExportSettings, settings } = useGlobalSettings()
  const [exportParams, setExportParams] = useState<ExportSettingsSchema>(settings.export)
  const [localExportSettings, setLocalExportSettings] = useState<EditableSchema<ExportSettingsSchema>>(() =>
    getEditableSchema(settings.export, { language: LANGUAGE }),
  )
  const { t } = useTranslation()
  const context = useMemo<BaseValidationContextSchema>(() => ({ language: LANGUAGE, t: t.validation }), [t.validation])

  const validationResult = useMemo<ValidationResultSchema<ExportSettingsSchema>>(
    () => validateExportSettingsSchema(localExportSettings, exportParams, context),
    [context, localExportSettings, exportParams],
  )

  const {
    layout,
    exportStatus,
    export: exportProject,
    reset,
    retryPreparation,
    controlsDisabled,
    exportDisabled,
    errorMessage,
    pageSize,
    drawAreaContext,
  } = useExportProject({ project, settings: exportParams, disabled: !isOpen, isValid: validationResult.isValid })

  // Save the export settings and close the dialog after a successful file export.
  useEffect(() => {
    if (!isOpen || exportStatus.type !== 'loaded') {
      return
    }
    setExportSettings(exportParams)
    onOpenChange(false)
  }, [exportStatus, exportParams, setExportSettings, onOpenChange, isOpen])

  const resetDraft = useCallback((): void => {
    setLocalExportSettings(getEditableSchema(settings.export, context))
    setExportParams(settings.export)
    reset()
  }, [context, settings.export, reset])

  const handleParamsChange = useCallback(
    (updatedEditableParams: EditableSchema<ExportSettingsSchema>): void => {
      const updatedValidationResult = validateExportSettingsSchema(updatedEditableParams, exportParams, context)

      reset()
      setLocalExportSettings(updatedEditableParams)
      setExportParams(updatedValidationResult.committedValue)
    },
    [context, exportParams, reset],
  )

  return (
    <EditDialog
      canSubmit={!exportDisabled}
      isOpen={isOpen}
      loading={exportStatus.type === 'loading'}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={exportProject}
      submit={t.dialogs.export.positiveAction}
      title={t.dialogs.export.title}
      errorMessage={errorMessage}
      sectionDividers={true}
      size="xl"
      scrollable={false}
    >
      <Box
        display="grid"
        gridTemplateColumns={`minmax(0, 1fr) ${EXPORT_PREVIEW_WIDTH}px`}
        flex="1"
        minHeight="0"
        minWidth="0"
      >
        <Box minHeight="0" minWidth="0" overflow="auto">
          <ExportEditor
            editable={localExportSettings}
            issues={validationResult.issues}
            onChange={handleParamsChange}
            disabled={controlsDisabled}
          />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          minHeight="0"
          minWidth="0"
          bg="bg.subtle"
          borderLeftWidth={`${EXPORT_PREVIEW_BORDER_WIDTH}px`}
          borderColor="border"
        >
          <Box flexShrink="0" bg="bg.emphasized/55" px="4" py="1" height="8" display="flex" alignItems="center">
            <Text color="fg.muted" fontWeight="bold" textStyle="sm">
              {t.dialogs.export.preview}
            </Text>
          </Box>
          <Box flex="1" minHeight="0" minWidth="0" overflow="auto" padding={`${EXPORT_PREVIEW_PADDING}px`} pt="4">
            <ExportPreview layout={layout} pageSize={pageSize} context={drawAreaContext} onRetry={retryPreparation} />
          </Box>
        </Box>
      </Box>
    </EditDialog>
  )
}
