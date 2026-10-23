import { IconType } from 'react-icons'
import {
  PiCardsThreeDuotone,
  PiNeedleDuotone,
  PiRectangleDashedDuotone,
  PiRectangleDuotone,
  PiWalletDuotone,
} from 'react-icons/pi'
import { ComponentSchema } from '../schemas/components'
import { HoleSchema } from '../schemas/hole'
import { StitchLineSchema } from '../schemas/stitching'

export const getModelIcon = (
  type: ComponentSchema['type'] | StitchLineSchema['type'] | HoleSchema['type'],
): IconType => {
  switch (type) {
    case 'root-panel':
      return PiWalletDuotone
    case 'front-pocket':
    case 't-pocket':
    case 'panel':
      return PiRectangleDuotone
    case 'pocket-cluster':
      return PiCardsThreeDuotone
    case 'hole':
      return PiRectangleDashedDuotone
    case 'component-bounds-stitch-line':
      return PiNeedleDuotone
    case 't-pocket-stitch-line':
      return PiNeedleDuotone
  }
}
