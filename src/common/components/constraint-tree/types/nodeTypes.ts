import type { ConstraintSchema } from '../../../schemas/constraints'

export type ConstraintTreeRootNode = {
  kind: 'root'
  id: string
  children: ConstraintTreeItemNode[]
}
export type ConstraintTreeItemNode = {
  kind: 'constraint'
  id: string
  constraint: ConstraintSchema
}
export type ConstraintTreeNode = ConstraintTreeRootNode | ConstraintTreeItemNode
