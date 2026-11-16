import { Icon, TreeView } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiLink } from 'react-icons/pi'
import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { useTranslation } from '../../hooks/useTranslation'
import { getBindingLabel } from '../binding-editors/bindingFieldUtils'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import type { BindingTreeItemNode } from './types/nodeTypes'

type BindingTreeItemProps = {
  node: BindingTreeItemNode
  onSelect: () => void
  renderMenu: (node: BindingTreeItemNode) => ReactNode
}
export const BindingTreeItem: FC<BindingTreeItemProps> = ({ node, onSelect, renderMenu }) => {
  const { t } = useTranslation()
  const selection = useSubProjectSelectionContext()
  const handlePointerEnter = useCallback((): void => selection.hover(node.binding), [node.binding, selection])
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
      data-binding-id={node.binding.id}
      h="9"
      py="0"
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <TreeItemVisual
        icon={<Icon as={PiLink} size="sm" />}
        isPositioned={false}
        leading={null}
        label={
          <TreeView.ItemText asChild>
            <TreeItemLabel>{getBindingLabel(node.binding, t)}</TreeItemLabel>
          </TreeView.ItemText>
        }
        trailing={renderMenu(node)}
      />
    </TreeView.Item>
  )
}
