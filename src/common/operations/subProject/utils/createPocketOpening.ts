import {
  defaultOpticalIllusionPocketOpening,
  defaultRecessedPocketOpening,
  defaultSlantedPocketOpening,
} from '../../../defaultStates'
import type { PocketOpeningSchema } from '../../../schemas/pocketOpening'

type CreatePocketOpeningParams = {
  type: PocketOpeningSchema['type']
  id: string
  name: string
}

export const createPocketOpening = ({ type, id, name }: CreatePocketOpeningParams): PocketOpeningSchema => {
  switch (type) {
    case 'straight':
      return { type, id, name }
    case 'recessed':
      return { ...defaultRecessedPocketOpening, type, id, name }
    case 'slanted':
      return { ...defaultSlantedPocketOpening, type, id, name }
    case 'optical-illusion':
      return { ...defaultOpticalIllusionPocketOpening, type, id, name }
  }
}
