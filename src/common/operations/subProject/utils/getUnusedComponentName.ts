import type { ComponentSchema } from '../../../schemas/components'
import type { SubProjectSchema } from '../../../schemas/subProject'
import type { TranslationSchema } from '../../../translations/translationSchema'
import { getComponentNameByType } from '../../../utils/getComponentNameByType'
import { getUnusedName } from './getUnusedName'

export const getUnusedComponentName = (
  type: ComponentSchema['type'],
  subProject: SubProjectSchema,
  defaultNames: TranslationSchema['defaultNames'],
): string => {
  const baseName = getComponentNameByType(type, defaultNames)
  const usedNames = new Set(Object.values(subProject.components).map((component) => component.name))
  return getUnusedName(baseName, usedNames)
}
