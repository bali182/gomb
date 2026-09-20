import { StitchLineSchema } from '../schemas/stitching'
import type { TranslationSchema2 } from '../translations/translationSchema'

export const getStitchLineNameByType = (
  type: StitchLineSchema['type'],
  defaultNames: TranslationSchema2['defaultNames'],
): string => {
  switch (type) {
    case 'component-bounds-stitch-line':
      return defaultNames.componentBoundsStitchLine
    case 'pocket-cluster-stitch-line':
      return defaultNames.pocketClusterStitchLine
  }
}
