import { createTreeCollection, type TreeCollection } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { getBindingLabel } from '../../binding-editors/bindingFieldUtils'
import type { BindingTreeItemNode, BindingTreeNode, BindingTreeRootNode } from '../types/nodeTypes'

export const getBindingNodeId = (bindingId: string): string => `binding:${bindingId}`

export const useBindingTreeCollection = (bindings: SubProjectSchema['bindings']): TreeCollection<BindingTreeNode> => {
  const { t } = useTranslation()
  return useMemo<TreeCollection<BindingTreeNode>>(() => {
    const rootNode: BindingTreeRootNode = {
      kind: 'root',
      id: 'binding-tree-root',
      children: Object.values(bindings).map(
        (binding): BindingTreeItemNode => ({
          kind: 'binding',
          id: getBindingNodeId(binding.id),
          binding,
        }),
      ),
    }
    return createTreeCollection<BindingTreeNode>({
      rootNode,
      nodeToChildren: (node): BindingTreeItemNode[] => (node.kind === 'root' ? node.children : []),
      nodeToChildrenCount: (node): number | undefined => (node.kind === 'root' ? node.children.length : undefined),
      nodeToString: (node): string => (node.kind === 'root' ? '' : getBindingLabel(node.binding, t)),
      nodeToValue: (node): string => node.id,
    })
  }, [bindings, t])
}
