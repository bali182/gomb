import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useEditorDialogsContext } from '../../contexts/EditorDialogsContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { accessors } from '../../utils/accessors'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { CloneMenuItem, CreateBindingsMenuItem, DeleteBindingsMenuItem, DeleteMenuItem } from './CommonActionsMenuItems'
import { SetDefaultPocketOpeningMenuItem } from './PocketOpeningActionsMenuItems'

type PocketOpeningActionsMenuProps = {
  opening: PocketOpeningSchema
  size: IconButtonProps['size']
  onDelete?: (openingId: string) => void
}

export const PocketOpeningActionsMenu: FC<PocketOpeningActionsMenuProps> = ({ opening, size, onDelete = noop }) => {
  const { openDialog } = useEditorDialogsContext()
  const { subProject } = useSubProject()
  const { deleteModelBindingFields, clonePocketOpening, deletePocketOpening, setDefaultPocketOpening } =
    useSubProjectOperations()
  const isDefault = subProject.defaultPocketOpening === opening.id

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleSetDefault = useCallback((): void => {
    setDefaultPocketOpening({ id: opening.id })
  }, [opening.id, setDefaultPocketOpening])

  const handleDelete = useCallback((): void => {
    deletePocketOpening({ id: opening.id })
    onDelete(opening.id)
  }, [deletePocketOpening, onDelete, opening.id])

  const hasBindings = useMemo<boolean>(
    () => accessors.subProject(subProject).binding.byModel(opening.id).length > 0,
    [subProject, opening.id],
  )

  const handleDeleteBindings = useCallback((): void => {
    deleteModelBindingFields({ modelId: opening.id })
  }, [deleteModelBindingFields, opening.id])

  const handleCreateBindings = useCallback((): void => {
    openDialog({ type: 'create-bindings', source: opening, subProject })
  }, [openDialog, opening, subProject])

  const handleClone = useCallback((): void => {
    clonePocketOpening({ id: opening.id })
  }, [clonePocketOpening, opening.id])

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
                <CreateBindingsMenuItem onSelect={handleCreateBindings} />
                <DeleteBindingsMenuItem disabled={!hasBindings} onSelect={handleDeleteBindings} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <CloneMenuItem onSelect={handleClone} />
                <DeleteMenuItem disabled={isDefault} onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
