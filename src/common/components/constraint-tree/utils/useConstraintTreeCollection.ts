import { createTreeCollection, type TreeCollection } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { getConstraintLabel } from '../../constraint-editors/constraintFieldUtils'
import type { ConstraintTreeItemNode, ConstraintTreeNode, ConstraintTreeRootNode } from '../types/nodeTypes'

export const getConstraintNodeId = (constraintId: string): string => `constraint:${constraintId}`

export const useConstraintTreeCollection = (
  constraints: SubProjectSchema['constraints'],
): TreeCollection<ConstraintTreeNode> => {
  const { t } = useTranslation()
  return useMemo<TreeCollection<ConstraintTreeNode>>(() => {
    const rootNode: ConstraintTreeRootNode = {
      kind: 'root',
      id: 'constraint-tree-root',
      children: Object.values(constraints).map(
        (constraint): ConstraintTreeItemNode => ({
          kind: 'constraint',
          id: getConstraintNodeId(constraint.id),
          constraint,
        }),
      ),
    }
    return createTreeCollection<ConstraintTreeNode>({
      rootNode,
      nodeToChildren: (node): ConstraintTreeItemNode[] => (node.kind === 'root' ? node.children : []),
      nodeToChildrenCount: (node): number | undefined => (node.kind === 'root' ? node.children.length : undefined),
      nodeToString: (node): string => (node.kind === 'root' ? '' : getConstraintLabel(node.constraint, t)),
      nodeToValue: (node): string => node.id,
    })
  }, [constraints, t])
}
