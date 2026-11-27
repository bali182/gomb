import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRefs'
import type { BindingSchema } from '../../schemas/bindings'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { DeleteMenuItem } from './CommonActionsMenuItems'

type BindingActionsMenuProps = {
  binding: BindingSchema
  size: IconButtonProps['size']
  onDelete?: (bindingId: string) => void
}
export const BindingActionsMenu: FC<BindingActionsMenuProps> = ({ binding, size, onDelete = noop }) => {
  const { deleteBinding } = useSubProjectOperations()

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleDelete = useCallback((): void => {
    deleteBinding({ id: binding.id })
    onDelete(binding.id)
  }, [binding.id, deleteBinding, onDelete])

  return (
    <Box onClick={handleClick}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton size={size} variant="ghost">
            <PiDotsThreeVertical />
          </IconButton>
        </Menu.Trigger>
        <Portal container={portalRef}>
          <Menu.Positioner>
            <Menu.Content>
              <ActionsMenuSection>
                <DeleteMenuItem onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
