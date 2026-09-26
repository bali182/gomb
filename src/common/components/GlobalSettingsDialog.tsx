import { useCallback, type FC } from 'react'

import { useTranslation } from '../hooks/useTranslation'
import { noop } from '../utils/noop'
import { EditDialog } from './EditDialog'
import { GlobalSettingsEditor } from './global-settings-editor/GlobalSettingsEditor'

type GlobalSettingsDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const GlobalSettingsDialog: FC<GlobalSettingsDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const handleSubmit = useCallback((): void => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <EditDialog
      canSubmit={true}
      hasCancel={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={noop}
      onSubmit={handleSubmit}
      submit={t.dialogs.globalSettings.positiveAction}
      title={t.dialogs.globalSettings.title}
    >
      <GlobalSettingsEditor />
    </EditDialog>
  )
}
