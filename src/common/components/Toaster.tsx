import { Toaster as ChakraToaster, createToaster, Icon, IconButton, Portal, Stack, Toast } from '@chakra-ui/react'
import type { FC } from 'react'
import type { IconType } from 'react-icons'
import { PiCheckCircle, PiInfo, PiWarningCircle, PiX } from 'react-icons/pi'

import { portalRef } from '../portalRef'
import { isDefined } from '../utils/isDefined'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
})

const getToastIcon = (type: string | undefined): IconType | undefined => {
  switch (type) {
    case 'success':
      return PiCheckCircle
    case 'error':
    case 'warning':
      return PiWarningCircle
    case 'info':
      return PiInfo
    default:
      return undefined
  }
}

export const Toaster: FC = () => {
  return (
    <Portal container={portalRef}>
      <ChakraToaster insetInline={{ mdDown: '4' }} toaster={toaster}>
        {(toast): React.JSX.Element => {
          const toastIcon = getToastIcon(toast.type)

          return (
            <Toast.Root alignItems="center" width={{ md: 'sm' }}>
              {isDefined(toastIcon) ? <Icon as={toastIcon} boxSize="5" flexShrink="0" /> : undefined}
              <Stack flex="1" gap="1">
                {isDefined(toast.title) ? <Toast.Title>{toast.title}</Toast.Title> : undefined}
                {isDefined(toast.description) ? <Toast.Description>{toast.description}</Toast.Description> : undefined}
              </Stack>
              {toast.closable ? (
                <IconButton onClick={() => toaster.dismiss(toast.id)} size="2xs" variant="ghost">
                  <PiX />
                </IconButton>
              ) : undefined}
            </Toast.Root>
          )
        }}
      </ChakraToaster>
    </Portal>
  )
}
