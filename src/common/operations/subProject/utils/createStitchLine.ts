import { defaultComponentBoundsStitchLine, defaultPocketClusterStitchLine } from '../../../defaultStates'
import type { HasTargetSchema } from '../../../schemas/common'
import type { StitchLineSchema } from '../../../schemas/stitching'

export const createStitchLine = (
  type: StitchLineSchema['type'],
  target: HasTargetSchema,
  id: string,
  name: string,
): StitchLineSchema => {
  switch (type) {
    case 'component-bounds-stitch-line':
      return { ...defaultComponentBoundsStitchLine, ...target, id, name, type }
    case 'pocket-cluster-stitch-line':
      if (target.targetType === 'hole') {
        throw new Error('Pocket cluster stitch lines cannot target holes')
      }
      return { ...defaultPocketClusterStitchLine, ...target, id, name, type }
  }
}
