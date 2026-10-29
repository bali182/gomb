import { defaultTPocketStitchLine } from '../../../defaultStates'
import type { TPocketStitchLineSchema } from '../../../schemas/stitching'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { safeId } from '../../../utils/id'
import { isDefined } from '../../../utils/isDefined'
import { getUnusedName } from './getUnusedName'

export const syncPocketStitchLines = (
  subProject: SubProjectSchema,
  targetPocketId: string,
  settings: Partial<TPocketStitchLineSchema>[],
): SubProjectSchema => {
  const target = accessors.subProject(subProject).tPocket(targetPocketId)
  const existing = accessors.subProject(subProject).tPocketStitchLines(targetPocketId)
  const usedIds = subProject.stitchLines.map((line) => line.id)
  const usedNames = new Set(subProject.stitchLines.map((line) => line.name))

  const replacements = settings.map<TPocketStitchLineSchema>((value, index) => {
    const previous = existing[index]
    const lineId = isDefined(previous) ? previous.id : safeId(usedIds)
    const name = isDefined(previous) ? previous.name : getUnusedName(target.name, usedNames)
    usedIds.push(lineId)
    usedNames.add(name)
    return {
      ...defaultTPocketStitchLine,
      ...value,
      id: lineId,
      name,
      type: 't-pocket-stitch-line',
      targetType: 'component',
      targetId: targetPocketId,
    }
  })

  let index = 0

  const stitchLines = subProject.stitchLines.flatMap((line) => {
    if (line.type !== 't-pocket-stitch-line' || line.targetId !== targetPocketId) {
      return [line]
    }
    const replacement = replacements[index++]
    return isDefined(replacement) ? [replacement] : []
  })

  stitchLines.push(...replacements.slice(existing.length))

  return { ...subProject, stitchLines }
}
