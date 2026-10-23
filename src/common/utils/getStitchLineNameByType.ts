import { StitchLineSchema } from '../schemas/stitching'
import type { TranslationSchema } from '../translations/translationSchema'

export const getStitchLineNameByType = (
  type: StitchLineSchema['type'],
  defaultNames: TranslationSchema['defaultNames'],
): string => {
  switch (type) {
    case 'component-bounds-stitch-line':
      return defaultNames.componentBoundsStitchLine
    case 't-pocket-stitch-line':
      return defaultNames.tPocketStitchLine
  }
}
