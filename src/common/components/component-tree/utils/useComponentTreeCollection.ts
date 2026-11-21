import { createTreeCollection, TreeCollection } from '@chakra-ui/react'
import { useMemo } from 'react'
import { SubProjectSchema } from '../../../schemas/subProject'
import { ProjectTreeNode } from '../types/nodeTypes'
import { getProjectTreeNodeLabel } from './getProjectTreeNodeLabel'
import { createTreeRootNode } from './treeNodeFactories'

export type UseComponentTreeCollection = {
  showStitchLines: boolean
  showHoles: boolean
}

export const useComponentTreeCollection = (
  subProject: SubProjectSchema,
  { showHoles = true, showStitchLines = true }: Partial<UseComponentTreeCollection> = {},
) => {
  return useMemo<TreeCollection<ProjectTreeNode>>(() => {
    return createTreeCollection<ProjectTreeNode>({
      nodeToChildren: (node) => node.children,
      nodeToChildrenCount: (node) => (node.kind === 'stitch-line' ? undefined : node.children.length),
      nodeToString: (node) => getProjectTreeNodeLabel(node),
      nodeToValue: (node) => node.id,
      rootNode: createTreeRootNode(subProject, showStitchLines, showHoles),
    })
  }, [showHoles, showStitchLines, subProject])
}
