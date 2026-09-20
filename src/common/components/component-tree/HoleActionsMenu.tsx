import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiCopy, PiDotsThreeVertical, PiTrash } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { HoleSchema } from '../../schemas/hole'
import { getModelIcon } from '../../utils/getModelIcon'
import { noop } from '../../utils/noop'

type HoleActionsMenuProps = {
  hole: HoleSchema
  size: IconButtonProps['size']
  onDelete?: (holeId: string) => void
}

export const HoleActionsMenu: FC<HoleActionsMenuProps> = ({ hole, size, onDelete = noop }) => {
  const { t } = useTranslation()
  const { addStitchLineToHole, cloneHole, deleteHole } = useSubProjectOperations()

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleAddStitchLine = useCallback((): void => {
    addStitchLineToHole(hole.id)
  }, [addStitchLineToHole, hole.id])

  const handleClone = useCallback((): void => {
    cloneHole(hole.id)
  }, [cloneHole, hole.id])

  const handleDelete = useCallback((): void => {
    deleteHole(hole.id)
    onDelete(hole.id)
  }, [deleteHole, hole.id, onDelete])

  const StitchLineIcon = getModelIcon('component-bounds-stitch-line')

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
              <Menu.Item onSelect={handleAddStitchLine} value="stitch-line">
                <StitchLineIcon />
                <Menu.ItemText>{t.project.editors.actions.holes.addStitching}</Menu.ItemText>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item onSelect={handleClone} value="clone">
                <PiCopy />
                <Menu.ItemText>{t.project.editors.actions.holes.clone}</Menu.ItemText>
              </Menu.Item>
              <Menu.Item
                onSelect={handleDelete}
                value="delete"
                color="fg.error"
                _hover={{ bg: 'bg.error', color: 'fg.error' }}
              >
                <PiTrash />
                <Menu.ItemText>{t.project.editors.actions.holes.delete}</Menu.ItemText>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
