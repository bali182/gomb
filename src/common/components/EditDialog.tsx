import { Button, Dialog, DialogRootProps, IconButton, Portal, VStack } from '@chakra-ui/react'
import { CSSProperties, PropsWithChildren, useCallback, useEffect, type FC, type SubmitEvent } from 'react'

import { PiX } from 'react-icons/pi'
import { portalRef } from '../../common/portalRef'
import { useTranslation } from '../hooks/useTranslation'
import { isDefined } from '../utils/isDefined'

type EditDialogProps = PropsWithChildren & {
  isOpen: boolean
  title: string
  description?: string
  submit: string
  canSubmit: boolean
  size?: DialogRootProps['size']
  loading?: boolean
  hasCancel?: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: () => void
  onResetData: () => void
}

const formStyle: CSSProperties = { display: 'flex', flex: '1', flexDirection: 'column', minHeight: '0px' }

export const EditDialog: FC<EditDialogProps> = ({
  isOpen,
  canSubmit,
  title,
  submit,
  children,
  size = 'lg',
  loading = false,
  description,
  hasCancel = true,
  onResetData,
  onOpenChange,
  onSubmit,
}) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpen) {
      return
    }
    onResetData()
  }, [isOpen, onResetData])

  const handleOpenChange = useCallback(
    (details: Dialog.OpenChangeDetails): void => {
      onOpenChange(details.open)
    },
    [onOpenChange],
  )

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>): void => {
      event.preventDefault()
      onSubmit()
    },
    [onSubmit],
  )

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={isOpen} size={size} placement="center" scrollBehavior="inside">
      <Portal container={portalRef}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <IconButton size="sm" variant="ghost">
                <PiX />
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <VStack align="stretch" gap="2">
                <Dialog.Title>{title}</Dialog.Title>
                {isDefined(description) && <Dialog.Description>{description}</Dialog.Description>}
              </VStack>
            </Dialog.Header>
            <form onSubmit={handleSubmit} style={formStyle}>
              <Dialog.Body px="0">{children}</Dialog.Body>
              <Dialog.Footer>
                {hasCancel && (
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">{t.dialogs.editDialog.negativeAction}</Button>
                  </Dialog.ActionTrigger>
                )}
                <Button disabled={!canSubmit} loading={loading} type="submit" variant="solid">
                  {submit}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
