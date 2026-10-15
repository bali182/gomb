import type { HasIdentitySchema } from '../../../schemas/common'
import type { PocketOpeningSchema } from '../../../schemas/components'
import { safeId } from '../../../utils/id'
import { getUnusedName } from './getUnusedName'

export const createPocketOpening = (openings: readonly HasIdentitySchema[], baseName: string): PocketOpeningSchema => {
  const usedIds = openings.map((opening) => opening.id.slice('own:'.length))
  const usedNames = new Set(openings.map((opening) => opening.name))

  return {
    id: `own:${safeId(usedIds)}`,
    name: getUnusedName(baseName, usedNames),
    type: 'straight',
  }
}
