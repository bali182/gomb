import { ComponentSchema } from '../schemas/components'
import type { TranslationSchema } from '../translations/translationSchema'

export const getComponentNameByType = (
  type: ComponentSchema['type'],
  defaultNames: TranslationSchema['defaultNames'],
): string => {
  switch (type) {
    case 'front-pocket':
      return defaultNames.frontPocket
    case 't-pocket':
      return defaultNames.tPocket
    case 'root-panel':
      return defaultNames.rootPanel
    case 'panel':
      return defaultNames.panel
    case 'pocket-cluster':
      return defaultNames.pocketCluster
  }
}
