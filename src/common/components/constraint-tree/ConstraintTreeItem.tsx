import { TreeView } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiLink } from 'react-icons/pi'
import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { useTranslation } from '../../hooks/useTranslation'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import { getConstraintLabel } from '../constraint-editors/constraintFieldUtils'
import type { ConstraintTreeItemNode } from './types/nodeTypes'

type ConstraintTreeItemProps = {
  node: ConstraintTreeItemNode
  onSelect: () => void
  renderMenu: (node: ConstraintTreeItemNode) => ReactNode
}
export const ConstraintTreeItem: FC<ConstraintTreeItemProps> = ({ node, onSelect, renderMenu }) => {
  const { t } = useTranslation()
  const selection = useSubProjectSelectionContext()
  const handlePointerEnter = useCallback((): void => selection.hover(node.constraint), [node.constraint, selection])
  const handlePointerLeave = useCallback((): void => selection.clearHover(), [selection])
  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      event.stopPropagation()
      onSelect()
    },
    [onSelect],
  )
  return (
    <TreeView.Item
      data-constraint-id={node.constraint.id}
      h="9"
      py="0"
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <TreeItemVisual
        icon={<PiLink />}
        isPositioned={false}
        leading={null}
        label={
          <TreeView.ItemText asChild>
            <TreeItemLabel>{getConstraintLabel(node.constraint, t)}</TreeItemLabel>
          </TreeView.ItemText>
        }
        trailing={renderMenu(node)}
      />
    </TreeView.Item>
  )
}
