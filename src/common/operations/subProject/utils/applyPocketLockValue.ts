import { isPocketLockSupported } from '../../../logic/pocketLockUtils'
import type { PocketSchema } from '../../../schemas/components'
import type { PocketLockPropertiesSchema } from '../../../schemas/lock'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { updateComponent } from '../updateComponent'

export const applyPocketLockValue = (
  subProject: SubProjectSchema,
  pocketId: string,
  property: PocketLockPropertiesSchema,
  value: Partial<PocketSchema>,
): SubProjectSchema => {
  const pocket = accessors.subProject(subProject).pocket(pocketId)
  if (property === 'pocket-stitching' || !isPocketLockSupported(pocket, property)) {
    return subProject
  }
  const component = Object.assign({}, pocket, structuredClone(value))
  return updateComponent(subProject, { component })
}
