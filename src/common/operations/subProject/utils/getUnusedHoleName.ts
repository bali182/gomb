import type { SubProjectSchema } from '../../../schemas/subProject'
import type { TranslationSchema } from '../../../translations/translationSchema'
import { getUnusedName } from './getUnusedName'

export const getUnusedHoleName = (
  subProject: SubProjectSchema,
  defaultNames: TranslationSchema['defaultNames'],
): string => {
  const usedNames = new Set(subProject.holes.map((hole) => hole.name))
  return getUnusedName(defaultNames.hole, usedNames)
}
