import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { HasTargetSchema } from '../../schemas/common'
import type { HoleSchema } from '../../schemas/hole'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { FlipHorizontalMenuItem, FlipVerticalMenuItem } from './CommonActionsMenuItems'
import { AddHoleStitchLineMenuItem, CloneHoleMenuItem, DeleteHoleMenuItem } from './HoleActionsMenuItems'

type HoleActionsMenuProps = {
  hole: HoleSchema
  size: IconButtonProps['size']
  onAddStitchLine?: (target: HasTargetSchema) => void
  onDelete?: (holeId: string) => void
}

export const HoleActionsMenu: FC<HoleActionsMenuProps> = ({ hole, size, onAddStitchLine = noop, onDelete = noop }) => {
  const { addStitchLineToHole, cloneHole, deleteHole, flip } = useSubProjectOperations()

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleAddStitchLine = useCallback((): void => {
    addStitchLineToHole(hole.id)
    onAddStitchLine({ targetId: hole.id, targetType: 'hole' })
  }, [addStitchLineToHole, hole.id, onAddStitchLine])

  const handleClone = useCallback((): void => {
    cloneHole(hole.id)
  }, [cloneHole, hole.id])

  const handleDelete = useCallback((): void => {
    deleteHole(hole.id)
    onDelete(hole.id)
  }, [deleteHole, hole.id, onDelete])

  const handleFlipHorizontal = useCallback((): void => {
    flip(hole, 'horizontal')
  }, [hole, flip])
  const handleFlipVertical = useCallback((): void => {
    flip(hole, 'vertical')
  }, [hole, flip])

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
                <AddHoleStitchLineMenuItem onSelect={handleAddStitchLine} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <FlipHorizontalMenuItem onSelect={handleFlipHorizontal} />
                <FlipVerticalMenuItem onSelect={handleFlipVertical} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <CloneHoleMenuItem onSelect={handleClone} />
                <DeleteHoleMenuItem onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
