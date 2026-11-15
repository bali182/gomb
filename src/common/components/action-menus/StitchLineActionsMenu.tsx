import { Box, IconButton, IconButtonProps, Menu, Portal } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useEditorDialogsContext } from '../../contexts/EditorDialogsContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { portalRef } from '../../portalRef'
import type { ComponentSchema } from '../../schemas/components'
import type { StitchLineSchema } from '../../schemas/stitching'
import { accessors } from '../../utils/accessors'
import { noop } from '../../utils/noop'
import { ActionsMenuSection } from './ActionsMenuSection'
import {
  CloneMenuItem,
  CreateConstraintsMenuItem,
  DeleteConstraintsMenuItem,
  DeleteMenuItem,
  FlipHorizontalMenuItem,
  FlipVerticalMenuItem,
} from './CommonActionsMenuItems'

type StitchLineActionsMenuProps = {
  stitchLine: StitchLineSchema
  size: IconButtonProps['size']
  onAddChild?: (parentId: string, type: ComponentSchema['type']) => void
  onAddStitchLine?: (componentId: string, type: StitchLineSchema['type']) => void
  onDelete?: (stitchLineId: string) => void
}

export const StitchLineActionsMenu: FC<StitchLineActionsMenuProps> = ({ stitchLine, size, onDelete = noop }) => {
  const { openDialog } = useEditorDialogsContext()
  const { subProject } = useSubProject()
  const { deleteModelConstraintFields, cloneStitchLine, deleteStitchLine, flip } = useSubProjectOperations()

  const handleActionsClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleDelete = useCallback((): void => {
    deleteStitchLine({ id: stitchLine.id })
    onDelete(stitchLine.id)
  }, [deleteStitchLine, stitchLine.id, onDelete])

  const hasConstraints = useMemo<boolean>(
    () => accessors.subProject(subProject).constraint.byModel(stitchLine.id).length > 0,
    [subProject, stitchLine.id],
  )

  const handleDeleteConstraints = useCallback((): void => {
    deleteModelConstraintFields({ modelId: stitchLine.id })
  }, [deleteModelConstraintFields, stitchLine.id])

  const handleCreateConstraints = useCallback((): void => {
    openDialog({ type: 'create-constraints', source: stitchLine, subProject })
  }, [openDialog, stitchLine, subProject])

  const handleClone = useCallback((): void => {
    cloneStitchLine({ id: stitchLine.id })
  }, [cloneStitchLine, stitchLine.id])

  const handleFlipHorizontal = useCallback((): void => {
    flip({ model: stitchLine, axis: 'horizontal' })
  }, [stitchLine, flip])

  const handleFlipVertical = useCallback((): void => {
    flip({ model: stitchLine, axis: 'vertical' })
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
                <CreateConstraintsMenuItem onSelect={handleCreateConstraints} />
                <DeleteConstraintsMenuItem disabled={!hasConstraints} onSelect={handleDeleteConstraints} />
              </ActionsMenuSection>
              <ActionsMenuSection>
                <CloneMenuItem onSelect={handleClone} />
                <DeleteMenuItem onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
