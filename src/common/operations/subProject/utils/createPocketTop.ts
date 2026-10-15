import type { HasIdentitySchema } from '../../../schemas/common'
import type { PocketOpeningSchema } from '../../../schemas/components'
import { safeId } from '../../../utils/id'
import { getUnusedName } from './getUnusedName'

export const createPocketTop = (pocketTops: readonly HasIdentitySchema[], baseName: string): PocketOpeningSchema => {
  const usedIds = pocketTops.map((pocketTop) => pocketTop.id.slice('own:'.length))
  const usedNames = new Set(pocketTops.map((pocketTop) => pocketTop.name))

  return {
    id: `own:${safeId(usedIds)}`,
    name: getUnusedName(baseName, usedNames),
    type: 'straight',
  }
}
