import type { IconType } from 'react-icons'
import { PiCardsThreeDuotone, PiNeedleDuotone, PiRectangleDuotone, PiWalletDuotone } from 'react-icons/pi'
import { HoleIcon } from '../components/icons/HoleIcon'
import { OpticalIllusionFrontPocketIcon } from '../components/icons/OpticalIllusionFrontPocketIcon'
import { OpticalIllusionTPocketIcon } from '../components/icons/OpticalIllusionTPocketIcon'
import { RecessedFrontPocketIcon } from '../components/icons/RecessedFrontPocketIcon'
import { RecessedTPocketIcon } from '../components/icons/RecessedTPocketIcon'
import { SlantedFrontPocketIcon } from '../components/icons/SlantedFrontPocketIcon'
import { SlantedTPocketIcon } from '../components/icons/SlantedTPocketIcon'
import { StraightFrontPocketIcon } from '../components/icons/StraightFrontPocketIcon'
import { StraightTPocketIcon } from '../components/icons/StraightTPocketIcon'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from './accessors'

const frontPocketIcons: Record<PocketOpeningSchema['type'], IconType> = {
  'optical-illusion': OpticalIllusionFrontPocketIcon,
  straight: StraightFrontPocketIcon,
  recessed: RecessedFrontPocketIcon,
  slanted: SlantedFrontPocketIcon,
}

const tPocketIcons: Record<PocketOpeningSchema['type'], IconType> = {
  'optical-illusion': OpticalIllusionTPocketIcon,
  straight: StraightTPocketIcon,
  recessed: RecessedTPocketIcon,
  slanted: SlantedTPocketIcon,
}

export const getModelIcon = (model: ModelObjectSchema, subProject: SubProjectSchema): IconType => {
  switch (model.type) {
    case 'front-pocket':
      return frontPocketIcons[accessors.subProject(subProject).pocketOpening.byId(model.openingId).type]
    case 't-pocket':
      return tPocketIcons[accessors.subProject(subProject).pocketOpening.byId(model.openingId).type]
    default:
      return getModelIconByType(model.type)
  }
}

export const getModelIconByType = (type: ModelObjectSchema['type']): IconType => {
  switch (type) {
    case 'root-panel':
      return PiWalletDuotone
    case 'front-pocket':
      return frontPocketIcons.straight
    case 't-pocket':
      return tPocketIcons.straight
    case 'panel':
      return PiRectangleDuotone
    case 'pocket-cluster':
      return PiCardsThreeDuotone
    case 'hole':
      return HoleIcon
    case 'component-bounds-stitch-line':
      return PiNeedleDuotone
    case 't-pocket-stitch-line':
      return PiNeedleDuotone
  }
}
