import {
  TreeView,
  type TreeCollection,
  type TreeViewBranchContentProps,
  type TreeViewExpandedChangeDetails,
  type TreeViewNodeRenderProps,
  type TreeViewSelectionChangeDetails,
} from '@chakra-ui/react'
import type { ReactElement, ReactNode } from 'react'

const branchContentProps: TreeViewBranchContentProps = {
  animationDuration: '200ms',
  animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  overflow: 'hidden',
  _open: { animationName: 'expand-height' },
  _closed: { animationName: 'collapse-height' },
}

export type TreeProps<T> = {
  collection: TreeCollection<T>
  selectedValue: string[]
  expandedValue?: string[]
  onSelectionChange: (details: TreeViewSelectionChangeDetails<T>) => void
  onExpandedChange?: (details: TreeViewExpandedChangeDetails<T>) => void
  renderNode: (props: TreeViewNodeRenderProps<T>) => ReactNode
}

export const Tree = <T,>({
  collection,
  selectedValue,
  expandedValue,
  onSelectionChange,
  onExpandedChange,
  renderNode,
}: TreeProps<T>): ReactElement => (
  <TreeView.Root
    animateContent
    lazyMount
    unmountOnExit
    collection={collection}
    selectedValue={selectedValue}
    expandedValue={expandedValue}
    expandOnClick={false}
    onSelectionChange={onSelectionChange}
    onExpandedChange={onExpandedChange}
    selectionMode="single"
  >
    <TreeView.Tree>
      <TreeView.Node<T>
        branchContentProps={branchContentProps}
        indentGuide={<TreeView.BranchIndentGuide />}
        render={renderNode}
      />
    </TreeView.Tree>
  </TreeView.Root>
)
