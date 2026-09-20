import { useCallback, useMemo, useState, type FC } from 'react'

import { LANGUAGE } from '../constants/language'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useProject } from '../hooks/useProject'
import { useTranslation } from '../hooks/useTranslation'
import { renderSvgToString } from '../logic/exports/renderSvgToString'
import { getComputedProject } from '../logic/getComputedProject'
import type { EditableSchema } from '../schemas/editable'
import type { BaseExportSettingsSchema } from '../schemas/settings'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { downloadFile } from '../utils/downloadFile'
import { getEditableSchema } from '../utils/getEditableSchema'
import { hasValidationErrors } from '../utils/hasValidationErrors'
import { validateBaseExportSettingsSchema } from '../validators/validateBaseExportSettingsSchema'
import { EditDialog } from './EditDialog'
import { SvgExportEditor } from './svg-export/SvgExportEditor'

type SvgExportDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const SvgExportDialog: FC<SvgExportDialogProps> = ({ isOpen, onOpenChange }) => {
  const { project } = useProject()
  const { setSvgExportSettings, settings } = useGlobalSettings()
  const { t } = useTranslation()
  const context = useMemo<BaseValidationContextSchema>(() => ({ language: LANGUAGE, t: t.validation }), [t.validation])
  const [localSvgExportSettings, setLocalSvgExportParams] = useState<BaseExportSettingsSchema>(settings.svgExport)

  const [editableParams, setEditableParams] = useState<EditableSchema<BaseExportSettingsSchema>>(() =>
    getEditableSchema(settings.svgExport, context),
  )

  const validationResult = useMemo(
    () => validateBaseExportSettingsSchema(editableParams, localSvgExportSettings, context),
    [context, editableParams, localSvgExportSettings],
  )

  const hasErrors = useMemo(
    () => hasValidationErrors<BaseExportSettingsSchema>(validationResult.issues),
    [validationResult.issues],
  )

  const resetDraft = useCallback((): void => {
    setLocalSvgExportParams(settings.svgExport)
    setEditableParams(getEditableSchema(settings.svgExport, context))
  }, [context, settings.svgExport])

  const handleParamsChange = useCallback(
    (updatedEditableParams: EditableSchema<BaseExportSettingsSchema>): void => {
      const updatedValidationResult = validateBaseExportSettingsSchema(
        updatedEditableParams,
        localSvgExportSettings,
        context,
      )

      setEditableParams(updatedEditableParams)
      setLocalSvgExportParams(updatedValidationResult.committedValue)
    },
    [context, localSvgExportSettings],
  )

  const handleSubmit = useCallback((): void => {
    const submitValidationResult = validateBaseExportSettingsSchema(editableParams, localSvgExportSettings, context)

    if (!submitValidationResult.isValid) {
      return
    }

    const computedProject = getComputedProject(project)
    const svg = renderSvgToString(project, computedProject, submitValidationResult.value)
    downloadFile({ contentType: 'image/svg+xml', content: svg, fileName: `${project.name}.svg` })
    setSvgExportSettings(submitValidationResult.value)
    onOpenChange(false)
  }, [context, editableParams, localSvgExportSettings, onOpenChange, project, setSvgExportSettings])

  return (
    <EditDialog
      canSubmit={!hasErrors}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      submit={t.dialogs.svgExport.positiveAction}
      title={t.dialogs.svgExport.title}
    >
      <SvgExportEditor editable={editableParams} issues={validationResult.issues} onChange={handleParamsChange} />
    </EditDialog>
  )
}
