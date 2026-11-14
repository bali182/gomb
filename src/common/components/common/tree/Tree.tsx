import {
  TreeView,
  useTreeView,
  type TreeCollection,
  type TreeViewBranchContentProps,
  type TreeViewExpandedChangeDetails,
  type TreeViewNodeProviderProps,
  type TreeViewNodeRenderProps,
  type TreeViewRootProps,
  type TreeViewSelectionChangeDetails,
  type UseTreeViewReturn,
} from '@chakra-ui/react'
import { useCallback, useMemo, type HTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { isDefined } from '../../../utils/isDefined'

const branchContentProps: TreeViewBranchContentProps = {
  animationDuration: '200ms',
  animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  overflow: 'hidden',
  _open: { animationName: 'expand-height' },
  _closed: { animationName: 'collapse-height' },
}

export type TreeSelectionMode = NonNullable<TreeViewRootProps['selectionMode']>

export type TreeProps<T> = {
  collection: TreeCollection<T>
  selection: string[]
  selectionMode: TreeSelectionMode
  expandedNodeIds?: string[]
  onSelectionChange: (selection: string[]) => void
  onExpandedChange?: (nodeIds: string[]) => void
  isNodeSelectable?: (node: T) => boolean
  renderNode: (props: TreeNodeRenderProps<T>) => ReactNode
}

export type TreeNodeRenderProps<T> = TreeViewNodeRenderProps<T> & {
  selectionMode: TreeSelectionMode
  isSelectable: boolean
  onSelect: () => void
}

export const Tree = <T,>({
  collection,
  selection,
  selectionMode,
  expandedNodeIds,
  onSelectionChange,
  onExpandedChange,
  isNodeSelectable,
  renderNode,
}: TreeProps<T>): ReactElement => {
  const handleSelectionChange = useCallback(
    (details: TreeViewSelectionChangeDetails<T>): void => {
      const selectedIds = details.selectedValue.filter((id) => {
        const node = collection.findNode(id)
        return isDefined(node) && (selection.includes(id) || (isNodeSelectable?.(node) ?? true))
      })
      const disabledSelectedIds = selection.filter((id) => {
        const node = collection.findNode(id)
        return isDefined(node) && !(isNodeSelectable?.(node) ?? true)
      })
      const nextSelection = Array.from(new Set([...disabledSelectedIds, ...selectedIds]))
      onSelectionChange(selectionMode === 'single' ? nextSelection.slice(0, 1) : nextSelection)
    },
    [collection, selection, selectionMode, isNodeSelectable, onSelectionChange],
  )

  const handleExpandedChange = useCallback(
    (details: TreeViewExpandedChangeDetails<T>): void => {
      onExpandedChange?.(details.expandedValue)
    },
    [onExpandedChange],
  )

  const treeView = useTreeView<T>({
    collection,
    selectedValue: selection,
    expandedValue: expandedNodeIds,
    expandOnClick: false,
    onSelectionChange: handleSelectionChange,
    onExpandedChange: handleExpandedChange,
    selectionMode,
  })

  const getItemProps = useCallback(
    (props: TreeViewNodeProviderProps<T>): HTMLAttributes<HTMLElement> => ({
      ...treeView.getItemProps(props),
      onClick: undefined,
    }),
    [treeView],
  )

  const getBranchControlProps = useCallback(
    (props: TreeViewNodeProviderProps<T>): HTMLAttributes<HTMLElement> => ({
      ...treeView.getBranchControlProps(props),
      onClick: undefined,
    }),
    [treeView],
  )

  const treeViewWithCustomSelection = useMemo<UseTreeViewReturn<T>>(
    () => ({ ...treeView, getItemProps, getBranchControlProps }),
    [treeView, getItemProps, getBranchControlProps],
  )

  const renderTreeNode = useCallback(
    (props: TreeViewNodeRenderProps<T>): ReactNode => {
      const id = props.nodeState.value
      const isSelectable = isNodeSelectable?.(props.node) ?? true
      const onSelect = (): void => {
        if (!isSelectable) {
          return
        }
        if (selectionMode === 'multiple' && selection.includes(id)) {
          onSelectionChange(selection.filter((selectedId) => selectedId !== id))
        } else {
          onSelectionChange(selectionMode === 'single' ? [id] : [...selection, id])
        }
      }
      return renderNode({ ...props, selectionMode, isSelectable, onSelect })
    },
    [selection, selectionMode, isNodeSelectable, onSelectionChange, renderNode],
  )

  return (
    <TreeView.RootProvider animateContent lazyMount unmountOnExit value={treeViewWithCustomSelection}>
      <TreeView.Tree>
        <TreeView.Node<T>
          branchContentProps={branchContentProps}
          indentGuide={<TreeView.BranchIndentGuide />}
          render={renderTreeNode}
        />
      </TreeView.Tree>
    </TreeView.RootProvider>
  )
}
