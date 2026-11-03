import type { StitchLineSchema } from '../../../schemas/stitching'
import type { PocketOpeningTreeItemNode } from '../../pocket-opening-tree/types/nodeTypes'
import type { ComponentTreeNode, HoleTreeNode, StitchLineTreeNode } from './nodeTypes'

export type ComponentTreeDragData = {
  kind: 'component'
  componentId: string
  indexPath: number[]
  node: ComponentTreeNode
}

export type HoleTreeDragData = {
  kind: 'hole'
  holeId: string
  indexPath: number[]
  node: HoleTreeNode
}

export type StitchLineTreeDragData = {
  kind: 'stitch-line'
  indexPath: number[]
  node: StitchLineTreeNode
  stitchLineId: string
  stitchLineType: StitchLineSchema['type']
}

export type PocketOpeningTreeDragData = {
  kind: 'pocket-opening'
  openingId: string
  indexPath: number[]
  node: PocketOpeningTreeItemNode
}

export type TreeDragData = ComponentTreeDragData | HoleTreeDragData | StitchLineTreeDragData | PocketOpeningTreeDragData
