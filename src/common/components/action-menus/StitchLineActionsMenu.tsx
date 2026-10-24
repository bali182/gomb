import { Box, IconButton, IconButtonProps, Menu, Portal } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { ComponentSchema } from '../../schemas/components'
import type { StitchLineSchema } from '../../schemas/stitching'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import { FlipHorizontalMenuItem, FlipVerticalMenuItem } from './CommonActionsMenuItems'
import { CloneStitchLineMenuItem, DeleteStitchLineMenuItem } from './StitchLineActionsMenuItems'

type StitchLineActionsMenuProps = {
  stitchLine: StitchLineSchema
  size: IconButtonProps['size']
  onAddChild?: (parentId: string, type: ComponentSchema['type']) => void
  onAddStitchLine?: (componentId: string, type: StitchLineSchema['type']) => void
  onDelete?: (stitchLineId: string) => void
}

export const StitchLineActionsMenu: FC<StitchLineActionsMenuProps> = ({ stitchLine, size, onDelete = noop }) => {
  const { cloneStitchLine, deleteStitchLine, flip } = useSubProjectOperations()

  const handleActionsClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleDelete = useCallback((): void => {
    deleteStitchLine(stitchLine.id)
    onDelete(stitchLine.id)
  }, [deleteStitchLine, stitchLine.id, onDelete])

  const handleClone = useCallback((): void => {
    cloneStitchLine(stitchLine.id)
  }, [cloneStitchLine, stitchLine.id])

  const handleFlipHorizontal = useCallback((): void => {
    flip(stitchLine, 'horizontal')
  }, [stitchLine, flip])

  const handleFlipVertical = useCallback((): void => {
    flip(stitchLine, 'vertical')
  }, [stitchLine, flip])

  return (
    <Box onClick={handleActionsClick}>
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
                <FlipHorizontalMenuItem onSelect={handleFlipHorizontal} />
                <FlipVerticalMenuItem onSelect={handleFlipVertical} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <CloneStitchLineMenuItem onSelect={handleClone} />
                <DeleteStitchLineMenuItem onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
