// Since typia generates code (a lot), we extract the typia checks and reuse them.

import typia from 'typia'

import type { TreeDragData } from './components/component-tree/types/dragDataTypes'
import type { TreeDropData } from './components/component-tree/types/dropDataTypes'
import type { ProjectSchema } from './schemas/project'
import type { GlobalSettingsSchema } from './schemas/settings'

export const isTreeDragData = (input: unknown): input is TreeDragData => {
  return typia.is<TreeDragData>(input)
}

export const isTreeDropData = (input: unknown): input is TreeDropData => {
  return typia.is<TreeDropData>(input)
}

export const assertAndPruneProjectSchema = typia.misc.createAssertPrune<ProjectSchema>()

export const assertAndPruneGlobalSettingsSchema = typia.misc.createAssertPrune<GlobalSettingsSchema>()
