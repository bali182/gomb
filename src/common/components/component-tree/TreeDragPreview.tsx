import { Box, IconButton, Text, type SystemStyleObject } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCaretRight, PiDotsSixVertical } from 'react-icons/pi'
import type { SubProjectSchema } from '../../schemas/subProject'
import { TreeItemVisual } from '../common/tree/TreeItemVisual'
import { PocketOpeningIcon } from '../pocket-opening-editors/PocketOpeningIcon'
import type { TreeDragData } from './types/dragDataTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type TreeDragPreviewProps = {
  dragData: TreeDragData
  subProject: SubProjectSchema
}

const previewStyles: SystemStyleObject = {
  alignItems: 'center',
  bg: 'bg.info/90',
  display: 'flex',
  height: '9',
  minWidth: '0',
  pointerEvents: 'none',
  px: '3',
  rounded: 'l2',
  textStyle: 'sm',
  userSelect: 'none',
  _icon: { boxSize: '4' },
}

export const TreeDragPreview: FC<TreeDragPreviewProps> = ({ dragData, subProject }) => {
  const { node } = dragData
  return (
    <Box aria-hidden="true" css={previewStyles}>
      {dragData.indexPath.slice(1).map((_index: number, depth: number) => (
        <Box key={depth} flexShrink="0" width="6" />
      ))}
      <TreeItemVisual
        icon={<TreeDragPreviewIcon dragData={dragData} subProject={subProject} />}
        isPositioned={false}
        trigger={
          node.kind === 'component' || node.kind === 'hole' ? (
            <PiCaretRight opacity={node.children.length > 0 ? undefined : 0.4} />
          ) : undefined
        }
        label={
          <Text flex="1">{node.kind === 'pocket-opening' ? node.opening.name : getProjectTreeNodeLabel(node)}</Text>
        }
        leading={
          <IconButton pointerEvents="none" size="2xs" variant="ghost" _hover={{ bg: 'transparent' }}>
            <PiDotsSixVertical />
          </IconButton>
        }
        trailing={null}
      />
    </Box>
  )
}

const TreeDragPreviewIcon: FC<TreeDragPreviewProps> = ({ dragData, subProject }) => {
  const { node } = dragData
  if (node.kind === 'pocket-opening') {
    return (
      <PocketOpeningIcon type={node.opening.type} isDefault={subProject.defaultPocketOpening === node.opening.id} />
    )
  }

  const Icon = getProjectTreeNodeIcon(node, subProject)
  return <Icon />
}
