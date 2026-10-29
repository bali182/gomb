import type { LockGroupIdSchema, PocketLockPropertiesSchema } from './lock'
import type { SubProjectSchema } from './subProject'

export type SubProjectLockAdjustmentSchema = {
  group: LockGroupIdSchema
  property: PocketLockPropertiesSchema
  sourceModelId: string
  adjustedModelIds: string[]
}

export type SubProjectOperationResultSchema<T> = {
  value: T
  adjustments: SubProjectLockAdjustmentSchema[]
}

export type ApplySubProjectLocksResultSchema = {
  subProject: SubProjectSchema
  adjustments: SubProjectLockAdjustmentSchema[]
}
