import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { ConstraintSchema } from '../../schemas/constraints'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { DeleteMenuItem } from './CommonActionsMenuItems'

type ConstraintActionsMenuProps = {
  constraint: ConstraintSchema
  size: IconButtonProps['size']
  onDelete?: (constraintId: string) => void
}
export const ConstraintActionsMenu: FC<ConstraintActionsMenuProps> = ({ constraint, size, onDelete = noop }) => {
  const { deleteConstraint } = useSubProjectOperations()

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleDelete = useCallback((): void => {
    deleteConstraint({ id: constraint.id })
    onDelete(constraint.id)
  }, [constraint.id, deleteConstraint, onDelete])

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
