import { createTreeCollection, type TreeCollection } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PocketOpeningSchema } from '../../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../../schemas/subProject'
import type { PocketOpeningTreeItemNode, PocketOpeningTreeNode, PocketOpeningTreeRootNode } from '../types/nodeTypes'

export const getPocketOpeningNodeId = (openingId: string): string => `pocket-opening:${openingId}`

export const usePocketOpeningTreeCollection = (
  pocketOpenings: SubProjectSchema['pocketOpenings'],
): TreeCollection<PocketOpeningTreeNode> =>
  useMemo<TreeCollection<PocketOpeningTreeNode>>((): TreeCollection<PocketOpeningTreeNode> => {
    const rootNode: PocketOpeningTreeRootNode = {
      kind: 'root',
      id: 'pocket-opening-tree-root',
      children: Object.values(pocketOpenings).map(
        (opening: PocketOpeningSchema): PocketOpeningTreeItemNode => ({
          kind: 'pocket-opening',
          id: getPocketOpeningNodeId(opening.id),
          opening,
        }),
      ),
    }
    return createTreeCollection<PocketOpeningTreeNode>({
      rootNode,
      nodeToChildren: (node: PocketOpeningTreeNode): PocketOpeningTreeItemNode[] =>
        node.kind === 'root' ? node.children : [],
      nodeToChildrenCount: (node: PocketOpeningTreeNode): number | undefined =>
        node.kind === 'root' ? node.children.length : undefined,
      nodeToString: (node: PocketOpeningTreeNode): string => (node.kind === 'root' ? '' : node.opening.name),
      nodeToValue: (node: PocketOpeningTreeNode): string => node.id,
    })
  }, [pocketOpenings])
