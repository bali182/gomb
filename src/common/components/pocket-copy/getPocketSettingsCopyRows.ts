import { getComponentParent } from '../../operations/subProject/utils/getComponentParent'
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
  const source = accessors.subProject(subProject).pocket(sourcePocketId)
  const cluster = getComponentParent(sourcePocketId, subProject)
  if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
    return []
  }

  const stitchedPocketIds = new Set(
    subProject.stitchLines.filter(narrowers.is.tPocketStitchLine).map((stitchLine) => stitchLine.targetId),
  )
  return cluster.children.map((pocketId): PocketSettingsCopyRowSchema => {
    const pocket = accessors.subProject(subProject).pocket(pocketId)
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
      overwriteStitching: {
        checked: canOverwrite && (selection?.overwriteStitching ?? true),
        disabled: !canOverwrite,
      },
    }
  })
}
