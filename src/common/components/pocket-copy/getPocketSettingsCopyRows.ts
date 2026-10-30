import type { PocketSettingsCopyRowSchema, PocketSettingsCopyTargetsSchema } from '../../schemas/pocketCopy'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export const getPocketSettingsCopyRows = (
  subProject: SubProjectSchema,
  sourcePocketId: string,
  targets: Partial<PocketSettingsCopyTargetsSchema>,
): PocketSettingsCopyRowSchema[] => {
  const accessor = accessors.subProject(subProject)
  const source = accessor.component.pocket(sourcePocketId)
  const cluster = accessor.optional.component.parent(sourcePocketId)
  if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
    return []
  }

  const stitchedPocketIds = new Set(
    subProject.stitchLines.filter(narrowers.is.tPocketStitchLine).map((stitchLine) => stitchLine.targetId),
  )
  return accessor.component.children(cluster.id).map((child): PocketSettingsCopyRowSchema => {
    const pocket = narrowers.assert.pocket(child)
    const pocketId = pocket.id
    const isSource = pocketId === sourcePocketId
    const selection = targets[pocketId]
    const canCopyShape = narrowers.is.tPocket(source) && narrowers.is.tPocket(pocket)
    const canCopyStitching = canCopyShape && stitchedPocketIds.has(sourcePocketId)
    const copyStitching = canCopyStitching && (isSource || selection?.copyStitching === true)
    const canOverwrite = !isSource && copyStitching && stitchedPocketIds.has(pocketId)

    return {
      pocketId,
      copyShape: {
        checked: canCopyShape && (isSource || selection?.copyShape === true),
        disabled: isSource || !canCopyShape,
      },
      copyOpening: {
        checked: isSource || selection?.copyOpening === true,
        disabled: isSource,
      },
      copyStitching: {
        checked: copyStitching,
        disabled: isSource || !canCopyStitching,
      },
      copyPocketItem: {
        checked: isSource || selection?.copyPocketItem === true,
        disabled: isSource,
      },
      overwriteStitching: {
        checked: canOverwrite && (selection?.overwriteStitching ?? true),
        disabled: !canOverwrite,
      },
    }
  })
}
