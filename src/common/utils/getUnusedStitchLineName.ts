import { getUnusedName } from '../operations/subProject/utils/getUnusedName'
import { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import type { TranslationSchema } from '../translations/translationSchema'
import { getStitchLineNameByType } from './getStitchLineNameByType'

export const getUnusedStitchLineName = (
  type: StitchLineSchema['type'],
  subProject: SubProjectSchema,
  defaultNames: TranslationSchema['defaultNames'],
): string => {
  const baseName = getStitchLineNameByType(type, defaultNames)
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  return getUnusedName(baseName, usedNames)
}
