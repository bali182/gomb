import { Button, Dialog, DialogRootProps, IconButton, Portal, VStack } from '@chakra-ui/react'
import { CSSProperties, PropsWithChildren, useCallback, useEffect, useId, type FC, type SubmitEvent } from 'react'

import { PiX } from 'react-icons/pi'
import { portalRef } from '../../common/portalRef'
import { useCommandBlocker } from '../hooks/useCommandBlocker'
import { useTranslation } from '../hooks/useTranslation'
import { isDefined } from '../utils/isDefined'

type EditDialogProps = PropsWithChildren & {
  isOpen: boolean
  title: string
  description?: string
  errorMessage?: string
  submit: string
  canSubmit: boolean
  size?: DialogRootProps['size']
  height?: Dialog.ContentProps['height']
  scrollable?: boolean
  sectionDividers?: boolean
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
  height,
  scrollable = true,
  sectionDividers = false,
  loading = false,
  description,
  errorMessage,
  hasCancel = true,
  onResetData,
  onOpenChange,
  onSubmit,
}) => {
  const id = useId()
  const { block, unblock } = useCommandBlocker()
  const { t } = useTranslation()
  const headerMessage = errorMessage ?? description

  useEffect(() => {
    if (!isOpen) {
      return
    }
    block(id)
    return () => unblock(id)
  }, [block, id, isOpen, unblock])

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
          <Dialog.Content height={height} overflow="hidden">
            <Dialog.CloseTrigger asChild>
              <IconButton size="sm" variant="ghost">
                <PiX />
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Header borderBottomWidth={sectionDividers ? '1px' : undefined} borderColor="border" flexShrink="0">
              <VStack align="stretch" gap="2">
                <Dialog.Title>{title}</Dialog.Title>
                {isDefined(headerMessage) && (
                  <Dialog.Description color={isDefined(errorMessage) ? 'fg.error' : undefined}>
                    {headerMessage}
                  </Dialog.Description>
                )}
              </VStack>
            </Dialog.Header>
            <form onSubmit={handleSubmit} style={formStyle}>
              <Dialog.Body
                display={scrollable ? undefined : 'flex'}
                minHeight="0"
                overflow={scrollable ? 'auto' : 'hidden'}
                p={scrollable ? undefined : '0'}
                px="0"
              >
                {children}
              </Dialog.Body>
              <Dialog.Footer borderTopWidth={sectionDividers ? '1px' : undefined} borderColor="border" flexShrink="0">
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
