import { updateProjectComponents } from '../operations/subProject/utils/updateProjectComponents'
import type { ComponentSchema, PocketClusterSchema } from '../schemas/components'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedPocketOpeningMappings = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  return updateProjectComponents(subProject, computedSubProject, (_id, component): ComponentSchema => {
    if (component.type !== 'pocket-cluster') {
      return component
    }
    const openingAccessor = accessors.pocketCluster(component)
    const entries = Object.entries(component.openingMapping)
    const remainingEntries = entries.filter(([key, openingId]) => {
      const pocketNumber = Number(key)
      return (
        Number.isInteger(pocketNumber) &&
        pocketNumber >= 1 &&
        pocketNumber <= component.pocketCount &&
        openingId !== component.defaultOpening.id &&
        isDefined(openingAccessor.optional.opening(openingId))
      )
    })
    if (remainingEntries.length === entries.length) {
      return component
    }

    const openingMapping: Partial<Record<number, string>> = Object.fromEntries(remainingEntries)
    const updatedComponent: PocketClusterSchema = { ...component, openingMapping }
    return updatedComponent
  })
}
