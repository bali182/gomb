import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { DeleteMenuItem } from './CommonActionsMenuItems'
import { SetDefaultPocketOpeningMenuItem } from './PocketOpeningActionsMenuItems'

type PocketOpeningActionsMenuProps = {
  opening: PocketOpeningSchema
  size: IconButtonProps['size']
  onDelete?: (openingId: string) => void
}

export const PocketOpeningActionsMenu: FC<PocketOpeningActionsMenuProps> = ({ opening, size, onDelete = noop }) => {
  const { subProject } = useSubProject()
  const { deletePocketOpening, setDefaultPocketOpening } = useSubProjectOperations()
  const isDefault = subProject.defaultPocketOpening === opening.id

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleSetDefault = useCallback((): void => {
    setDefaultPocketOpening(opening.id)
  }, [opening.id, setDefaultPocketOpening])

  const handleDelete = useCallback((): void => {
    deletePocketOpening(opening.id)
    onDelete(opening.id)
  }, [deletePocketOpening, onDelete, opening.id])

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
                <SetDefaultPocketOpeningMenuItem disabled={isDefault} onSelect={handleSetDefault} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <DeleteMenuItem disabled={isDefault} onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
