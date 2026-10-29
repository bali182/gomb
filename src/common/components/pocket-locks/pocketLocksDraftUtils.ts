import { getOrderedPockets, getPocketLockValueKey, isPocketLockSupported } from '../../logic/pocketLockUtils'
import type { PocketSchema } from '../../schemas/components'
import {
  lockGroupIds,
  pocketLockProperties,
  type LockGroupIdSchema,
  type PocketLockPropertiesSchema,
  type PocketLocksDraftSchema,
} from '../../schemas/lock'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'

const setSample = (
  subProject: SubProjectSchema,
  draft: PocketLocksDraftSchema,
  pocket: PocketSchema,
  property: PocketLockPropertiesSchema,
  group: LockGroupIdSchema,
): void => {
  const samples = draft.sampleKeys[group] ?? {}
  samples[property] = getPocketLockValueKey(subProject, pocket, property)
  draft.sampleKeys[group] = samples
}

const refreshSamples = (subProject: SubProjectSchema, draft: PocketLocksDraftSchema): void => {
  const pockets = getOrderedPockets(subProject)
  for (const group of lockGroupIds) {
    for (const property of pocketLockProperties) {
      const members = pockets.filter(
        (pocket) => draft.locks.components[pocket.id]?.[property] === group && isPocketLockSupported(pocket, property),
      )
      const sampleKey = draft.sampleKeys[group]?.[property]
      const hasMatchingMember =
        isDefined(sampleKey) &&
        members.some((pocket) => getPocketLockValueKey(subProject, pocket, property) === sampleKey)
      if (hasMatchingMember) {
        continue
      }
      const first = members[0]
      if (isDefined(first)) {
        setSample(subProject, draft, first, property, group)
      } else {
        const samples = draft.sampleKeys[group]
        if (isDefined(samples)) {
          delete samples[property]
        }
      }
    }
  }
}

export const createPocketLocksDraft = (subProject: SubProjectSchema): PocketLocksDraftSchema => {
  const draft: PocketLocksDraftSchema = { locks: structuredClone(subProject.locks), sampleKeys: {} }
  refreshSamples(subProject, draft)
  return draft
}

export const setPocketLockMembership = (
  subProject: SubProjectSchema,
  draft: PocketLocksDraftSchema,
  pocketIds: string[],
  properties: readonly PocketLockPropertiesSchema[],
  group: LockGroupIdSchema,
  checked: boolean,
): PocketLocksDraftSchema => {
  const updated = structuredClone(draft)
  const pockets = getOrderedPockets(subProject).filter((pocket) => pocketIds.includes(pocket.id))

  for (const pocket of pockets) {
    const assignments = updated.locks.components[pocket.id] ?? {}
    for (const property of properties) {
      if (!isPocketLockSupported(pocket, property)) {
        continue
      }
      if (checked) {
        assignments[property] = group
      } else if (assignments[property] === group) {
        delete assignments[property]
      }
    }
    if (Object.keys(assignments).length > 0) {
      updated.locks.components[pocket.id] = assignments
    } else {
      delete updated.locks.components[pocket.id]
    }
  }
  refreshSamples(subProject, updated)
  return updated
}

export const selectPocketLockSample = (
  subProject: SubProjectSchema,
  draft: PocketLocksDraftSchema,
  pocket: PocketSchema,
  property: PocketLockPropertiesSchema,
  group: LockGroupIdSchema,
): PocketLocksDraftSchema => {
  if (!isPocketLockSupported(pocket, property)) {
    return draft
  }
  const updated = structuredClone(draft)
  setSample(subProject, updated, pocket, property, group)
  return updated
}

export const isPocketLockSample = (
  subProject: SubProjectSchema,
  draft: PocketLocksDraftSchema,
  pocket: PocketSchema,
  property: PocketLockPropertiesSchema,
  group: LockGroupIdSchema,
): boolean => {
  if (!isPocketLockSupported(pocket, property)) {
    return false
  }
  const sampleKey = draft.sampleKeys[group]?.[property]
  return isDefined(sampleKey) && getPocketLockValueKey(subProject, pocket, property) === sampleKey
}
