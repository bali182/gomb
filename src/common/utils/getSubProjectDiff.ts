import type { SubProjectSchema } from '../schemas/subProject'
import type { ChangeSchema, SubProjectDiffSchema } from '../schemas/subProjectDiff'
import { comparators } from './comparators'
import { isDefined } from './isDefined'

const getChangesFromRecord = <T>(
  before: Readonly<Record<string, T>>,
  after: Readonly<Record<string, T>>,
  compare: (before: T, after: T) => boolean,
): Record<string, ChangeSchema<T>> => {
  const changes: Record<string, ChangeSchema<T>> = {}
  for (const id of Object.keys(before)) {
    const previous = before[id]
    const current = after[id]
    if (previous === current || (isDefined(current) && compare(previous, current))) {
      continue
    }
    changes[id] = { before: previous, after: current }
  }
  for (const id of Object.keys(after)) {
    if (!isDefined(before[id])) {
      changes[id] = { before: undefined, after: after[id] }
    }
  }
  return changes
}

export const getSubProjectDiff = (
  before: SubProjectSchema | undefined,
  after: SubProjectSchema,
): SubProjectDiffSchema => {
  return {
    root: before?.root === after.root ? undefined : { before: before?.root, after: after.root },
    defaultPocketOpening:
      before?.defaultPocketOpening === after.defaultPocketOpening
        ? undefined
        : { before: before?.defaultPocketOpening, after: after.defaultPocketOpening },
    components: getChangesFromRecord(before?.components ?? {}, after.components, comparators.component),
    holes: getChangesFromRecord(
      Object.fromEntries((before?.holes ?? []).map((hole) => [hole.id, hole])),
      Object.fromEntries(after.holes.map((hole) => [hole.id, hole])),
      comparators.hole,
    ),
    stitchLines: getChangesFromRecord(
      Object.fromEntries((before?.stitchLines ?? []).map((stitchLine) => [stitchLine.id, stitchLine])),
      Object.fromEntries(after.stitchLines.map((stitchLine) => [stitchLine.id, stitchLine])),
      comparators.stitchLine,
    ),
    pocketOpenings: getChangesFromRecord(before?.pocketOpenings ?? {}, after.pocketOpenings, comparators.pocketOpening),
    constraints: getChangesFromRecord(before?.constraints ?? {}, after.constraints, comparators.constraint),
  }
}
