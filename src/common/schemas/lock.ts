export type LockGroupIdSchema = '1' | '2' | '3' | '4' | '5'

export const lockGroupIds: readonly LockGroupIdSchema[] = ['1', '2', '3', '4', '5']

export type PocketLockPropertiesSchema = 'pocket-contents' | 'pocket-shape' | 'pocket-opening' | 'pocket-stitching'

export const pocketLockProperties: readonly PocketLockPropertiesSchema[] = [
  'pocket-contents',
  'pocket-shape',
  'pocket-opening',
  'pocket-stitching',
]

export type ComponentLockPropertiesSchema = PocketLockPropertiesSchema

export type ComponentLocksSchema = Partial<Record<ComponentLockPropertiesSchema, LockGroupIdSchema>>

export type SubProjectLocksSchema = {
  components: Record<string, ComponentLocksSchema>
}

export type PocketLocksDraftSchema = {
  locks: SubProjectLocksSchema
  /**
   * The serialized keys built from actual values in the locked models,
   * that we will consider the "sample" to copy to others, when locking unrelated model objects
   */
  sampleKeys: Partial<Record<LockGroupIdSchema, Partial<Record<PocketLockPropertiesSchema, string>>>>
}
