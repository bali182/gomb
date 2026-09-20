import { Box, IconButton, IconButtonProps, Menu, Portal } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiCopy, PiDotsThreeVertical, PiSquareSplitHorizontal, PiSquareSplitVertical, PiTrash } from 'react-icons/pi'
import { useSubProjectOperations } from '../hooks/useSubProjectOperations'
import { useTranslation } from '../hooks/useTranslation'
import { flipComponentBoundsStitchLine } from '../logic/flipComponentBoundsStitchLine'
import { portalRef } from '../portalRef'
import type { ComponentSchema } from '../schemas/components'
import type { StitchLineSchema } from '../schemas/stitching'
import { noop } from '../utils/noop'

type StitchLineActionsMenuProps = {
  stitchLine: StitchLineSchema
  size: IconButtonProps['size']
  onAddChild?: (parentId: string, type: ComponentSchema['type']) => void
  onAddStitchLine?: (componentId: string, type: StitchLineSchema['type']) => void
  onDelete?: (stitchLineId: string) => void
}

export const StitchLineActionsMenu: FC<StitchLineActionsMenuProps> = ({ stitchLine, size, onDelete = noop }) => {
  const { t } = useTranslation()
  const { cloneStitchLine, deleteStitchLine, updateStitchLine } = useSubProjectOperations()

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
    if (stitchLine.type !== 'component-bounds-stitch-line') {
      return
    }

    updateStitchLine(flipComponentBoundsStitchLine(stitchLine, 'horizontal'))
  }, [stitchLine, updateStitchLine])

  const handleFlipVertical = useCallback((): void => {
    if (stitchLine.type !== 'component-bounds-stitch-line') {
      return
    }

    updateStitchLine(flipComponentBoundsStitchLine(stitchLine, 'vertical'))
  }, [stitchLine, updateStitchLine])

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
              {stitchLine.type === 'component-bounds-stitch-line' && (
                <>
                  <Menu.Item onSelect={handleFlipHorizontal} value="flip-horizontal">
                    <PiSquareSplitHorizontal />
                    <Menu.ItemText>{t.project.editors.actions.stitchLines.flipHorizontal}</Menu.ItemText>
                  </Menu.Item>
                  <Menu.Item onSelect={handleFlipVertical} value="flip-vertical">
                    <PiSquareSplitVertical />
                    <Menu.ItemText>{t.project.editors.actions.stitchLines.flipVertical}</Menu.ItemText>
                  </Menu.Item>
                  <Menu.Separator />
                </>
              )}
              <Menu.Item onSelect={handleClone} value="clone">
                <PiCopy />
                <Menu.ItemText>{t.project.editors.actions.stitchLines.clone}</Menu.ItemText>
              </Menu.Item>
              <Menu.Item
                onSelect={handleDelete}
                value="delete"
                color="fg.error"
                _hover={{ bg: 'bg.error', color: 'fg.error' }}
              >
                <PiTrash />
                <Menu.ItemText>{t.project.editors.actions.stitchLines.delete}</Menu.ItemText>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
