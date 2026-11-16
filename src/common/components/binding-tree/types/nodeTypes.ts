import type { BindingSchema } from '../../../schemas/bindings'

export type BindingTreeRootNode = {
  kind: 'root'
  id: string
  children: BindingTreeItemNode[]
}
export type BindingTreeItemNode = {
  kind: 'binding'
  id: string
  binding: BindingSchema
}
export type BindingTreeNode = BindingTreeRootNode | BindingTreeItemNode
