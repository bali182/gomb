import type { ComponentSchema } from '../../../schemas/components'
import type { HoleSchema } from '../../../schemas/hole'
import type { StitchLineSchema } from '../../../schemas/stitching'

export type ComponentTreeNode = {
  kind: 'component'
  id: string
  component: ComponentSchema
  hasPocketInSubtree: boolean
  parentId: string | undefined
  nextSiblingId: string | undefined
  children: ProjectTreeNode[]
}

export type HoleTreeNode = {
  kind: 'hole'
  id: string
  hole: HoleSchema
  children: StitchLineTreeNode[]
}

export type StitchLineTreeNode = {
  kind: 'stitch-line'
  id: string
  stitchLine: StitchLineSchema
  children: []
}

export type ProjectTreeNode = ComponentTreeNode | HoleTreeNode | StitchLineTreeNode
