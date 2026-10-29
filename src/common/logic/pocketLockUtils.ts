import { getComponentDescendants } from '../operations/subProject/utils/getComponentDescendants'
import type { PocketSchema } from '../schemas/components'
import type { PocketLockPropertiesSchema } from '../schemas/lock'
import type { TPocketStitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'

export const getOrderedPockets = (subProject: SubProjectSchema): PocketSchema[] => {
  const source = accessors.subProject(subProject)
  return getComponentDescendants(source.rootPanel(), subProject).map(source.component).filter(narrowers.is.pocket)
}

export const isPocketLockSupported = (pocket: PocketSchema, property: PocketLockPropertiesSchema): boolean =>
  property === 'pocket-contents' || property === 'pocket-opening' || pocket.type === 't-pocket'

export const getPocketLockValue = (
  pocket: PocketSchema,
  property: PocketLockPropertiesSchema,
): Partial<PocketSchema> => {
  switch (property) {
    case 'pocket-contents': {
      const { itemId, itemOrientation, itemCrossAxisOffset, itemOpeningOffset } = pocket
      return { itemId, itemOrientation, itemCrossAxisOffset, itemOpeningOffset }
    }
    case 'pocket-shape': {
      if (pocket.type === 't-pocket') {
        const { tPocketTabWidth, tPocketTaper } = pocket
        return { tPocketTabWidth, tPocketTaper }
      }
      return {}
    }
    case 'pocket-opening': {
      const { opening } = pocket
      return { opening }
    }
    case 'pocket-stitching':
      return {}
  }
}

export const getPocketStitchingLockValue = (
  subProject: SubProjectSchema,
  pocket: PocketSchema,
): Partial<TPocketStitchLineSchema>[] => {
  if (pocket.type !== 't-pocket') {
    return []
  }
  return accessors
    .subProject(subProject)
    .tPocketStitchLines(pocket.id)
    .map(
      ({
        stitchMargin,
        stitchHoleLength,
        stitchHoleDistance,
        stitchHoleThickness,
        stitchLineThickness,
        startOffset,
        endOffset,
        stitchDirection,
      }) => ({
        stitchMargin,
        stitchHoleLength,
        stitchHoleDistance,
        stitchHoleThickness,
        stitchLineThickness,
        startOffset,
        endOffset,
        stitchDirection,
      }),
    )
}

export const getPocketLockValueKey = (
  subProject: SubProjectSchema,
  pocket: PocketSchema,
  property: PocketLockPropertiesSchema,
): string => {
  switch (property) {
    case 'pocket-stitching':
      return JSON.stringify(getPocketStitchingLockValue(subProject, pocket))
    default:
      return JSON.stringify(getPocketLockValue(pocket, property))
  }
}
