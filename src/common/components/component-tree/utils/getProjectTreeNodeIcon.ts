import { IconType } from 'react-icons'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { getModelIcon, getModelIconByType } from '../../../utils/getModelIcon'
import { ProjectTreeNode } from '../types/nodeTypes'

export const getProjectTreeNodeIcon = (node: ProjectTreeNode, subProject: SubProjectSchema): IconType => {
  switch (node.kind) {
    case 'component':
      return getModelIcon(node.component, subProject)
    case 'hole':
      return getModelIconByType(node.hole.type)
    case 'stitch-line':
      return getModelIconByType(node.stitchLine.type)
  }
}
