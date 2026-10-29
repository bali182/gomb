import {
  getOrderedPockets,
  getPocketLockValue,
  getPocketLockValueKey,
  getPocketStitchingLockValue,
  isPocketLockSupported,
} from '../../../logic/pocketLockUtils'
import type { PocketSchema } from '../../../schemas/components'
import { lockGroupIds, pocketLockProperties } from '../../../schemas/lock'
import type { ModelObjectSchema } from '../../../schemas/modelObject'
import type { SubProjectSchema } from '../../../schemas/subProject'
import type {
  ApplySubProjectLocksResultSchema,
  SubProjectLockAdjustmentSchema,
} from '../../../schemas/subProjectOperation'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { applyPocketLockValue } from './applyPocketLockValue'
import { syncPocketStitchLines } from './syncPocketStitchLines'

type PocketLockChange = SubProjectLockAdjustmentSchema & {
  targetModelIds: string[]
}

export const applySubProjectLocks = (
  before: SubProjectSchema,
  after: SubProjectSchema,
  _model: ModelObjectSchema,
): ApplySubProjectLocksResultSchema => {
  const cleaned = removeDeletedLockMemberships(after)
  const changes = findPocketLockChanges(before, cleaned)
  return applyPocketLockChanges(cleaned, changes)
}

const removeDeletedLockMemberships = (subProject: SubProjectSchema): SubProjectSchema => {
  const source = accessors.subProject(subProject)
  const components = Object.fromEntries(
    Object.entries(subProject.locks.components).filter(([id]) => isDefined(source.optional.component(id))),
  )
  return Object.keys(components).length === Object.keys(subProject.locks.components).length
    ? subProject
    : { ...subProject, locks: { components } }
}

const getOrderedLockPockets = (before: SubProjectSchema, after: SubProjectSchema): PocketSchema[] => {
  // Preserve the pre-operation order for source selection; append any new pockets.
  const afterPockets = getOrderedPockets(after)
  const pocketsById = new Map(afterPockets.map((pocket) => [pocket.id, pocket]))
  const orderedIds = new Set([
    ...getOrderedPockets(before).map((pocket) => pocket.id),
    ...afterPockets.map((pocket) => pocket.id),
  ])
  return [...orderedIds].map((id) => pocketsById.get(id)).filter(isDefined)
}

const findPocketLockChanges = (before: SubProjectSchema, after: SubProjectSchema): PocketLockChange[] => {
  const previousSource = accessors.subProject(before)
  const pockets = getOrderedLockPockets(before, after)
  const changes: PocketLockChange[] = []

  for (const group of lockGroupIds) {
    for (const property of pocketLockProperties) {
      const members = pockets
        .filter(
          (pocket) =>
            after.locks.components[pocket.id]?.[property] === group && isPocketLockSupported(pocket, property),
        )
        .map((pocket) => {
          const key = getPocketLockValueKey(after, pocket, property)
          const previous = previousSource.optional.component(pocket.id)
          const changed =
            isDefined(previous) &&
            narrowers.is.pocket(previous) &&
            getPocketLockValueKey(before, previous, property) !== key
          return { modelId: pocket.id, key, changed }
        })
      const source = members.find((member) => member.changed)
      if (!isDefined(source)) {
        continue
      }
      const targets = members.filter((member) => member.key !== source.key)
      if (targets.length === 0) {
        continue
      }
      changes.push({
        group,
        property,
        sourceModelId: source.modelId,
        targetModelIds: targets.map((member) => member.modelId),
        adjustedModelIds: targets.filter((member) => member.changed).map((member) => member.modelId),
      })
    }
  }
  return changes
}

const applyPocketLockChanges = (
  subProject: SubProjectSchema,
  changes: PocketLockChange[],
): ApplySubProjectLocksResultSchema => {
  const source = accessors.subProject(subProject)
  let updated = subProject
  const adjustments: SubProjectLockAdjustmentSchema[] = []

  for (const { group, property, sourceModelId, targetModelIds, adjustedModelIds } of changes) {
    // Always read the operation result, never values written by a preceding lock.
    const pocket = source.pocket(sourceModelId)
    switch (property) {
      case 'pocket-stitching': {
        const sample = getPocketStitchingLockValue(subProject, pocket)
        for (const targetId of targetModelIds) {
          updated = syncPocketStitchLines(updated, targetId, sample)
        }
        break
      }
      default: {
        const sample = getPocketLockValue(pocket, property)
        for (const targetId of targetModelIds) {
          updated = applyPocketLockValue(updated, targetId, property, sample)
        }
      }
    }
    if (adjustedModelIds.length > 0) {
      adjustments.push({ group, property, sourceModelId, adjustedModelIds })
    }
  }
  return { subProject: updated, adjustments }
}
