import { defaultRecessedPocketOpening } from '../../../defaultStates'
import type { HasIdentitySchema } from '../../../schemas/common'
import type { PocketOpeningOwnSchema, PocketOpeningSchema } from '../../../schemas/components'
import { safeId } from '../../../utils/id'
import { getUnusedName } from './getUnusedName'

export const createPocketOpening = (
  type: PocketOpeningOwnSchema['type'],
  openings: readonly HasIdentitySchema[],
  baseName: string,
): PocketOpeningSchema => {
  const usedIds = openings.map((opening) => opening.id.slice('own:'.length))
  const usedNames = new Set(openings.map((opening) => opening.name))

  const identity: HasIdentitySchema = {
    id: `own:${safeId(usedIds)}`,
    name: getUnusedName(baseName, usedNames),
  }

  switch (type) {
    case 'straight':
      return { ...identity, type: 'straight' }
    case 'recessed':
      return { ...defaultRecessedPocketOpening, ...identity }
  }
}
