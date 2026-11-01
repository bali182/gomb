import type { PocketOpeningSchema } from '../../../schemas/pocketOpening'

export type PocketOpeningTreeRootNode = {
  kind: 'root'
  id: string
  children: PocketOpeningTreeItemNode[]
}

export type PocketOpeningTreeItemNode = {
  kind: 'pocket-opening'
  id: string
  opening: PocketOpeningSchema
}

export type PocketOpeningTreeNode = PocketOpeningTreeRootNode | PocketOpeningTreeItemNode
