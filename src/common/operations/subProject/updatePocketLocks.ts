import {
  getOrderedPockets,
  getPocketLockValue,
  getPocketLockValueKey,
  getPocketStitchingLockValue,
  isPocketLockSupported,
} from '../../logic/pocketLockUtils'
import { lockGroupIds, pocketLockProperties, type PocketLocksDraftSchema } from '../../schemas/lock'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { applyPocketLockValue } from './utils/applyPocketLockValue'
import { syncPocketStitchLines } from './utils/syncPocketStitchLines'

export const updatePocketLocks = (subProject: SubProjectSchema, draft: PocketLocksDraftSchema): SubProjectSchema => {
  const pockets = getOrderedPockets(subProject)
  let updated: SubProjectSchema = { ...subProject, locks: structuredClone(draft.locks) }
  for (const group of lockGroupIds) {
    for (const property of pocketLockProperties) {
      const sampleKey = draft.sampleKeys[group]?.[property]
      if (!isDefined(sampleKey)) {
        continue
      }
      const members = pockets.filter(
        (pocket) => draft.locks.components[pocket.id]?.[property] === group && isPocketLockSupported(pocket, property),
      )
      if (members.length === 0) {
        continue
      }
      const source = pockets.find(
        (pocket) =>
          isPocketLockSupported(pocket, property) && getPocketLockValueKey(subProject, pocket, property) === sampleKey,
      )
      if (!isDefined(source)) {
        throw new Error(`Missing pocket lock sample for ${group}: ${property}`)
      }
      const targets = members.filter((pocket) => getPocketLockValueKey(subProject, pocket, property) !== sampleKey)
      switch (property) {
        case 'pocket-stitching': {
          const sample = getPocketStitchingLockValue(subProject, source)
          for (const pocket of targets) {
            updated = syncPocketStitchLines(updated, pocket.id, sample)
          }
          break
        }
        default: {
          const sample = getPocketLockValue(source, property)
          for (const pocket of targets) {
            updated = applyPocketLockValue(updated, pocket.id, property, sample)
          }
        }
      }
    }
  }
  return updated
}
