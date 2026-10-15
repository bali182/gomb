import { updateProjectComponents } from '../operations/subProject/utils/updateProjectComponents'
import type { ComponentSchema, PocketClusterSchema } from '../schemas/components'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedPocketTopMappings = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  return updateProjectComponents(subProject, computedSubProject, (_id, component): ComponentSchema => {
    if (component.type !== 'pocket-cluster') {
      return component
    }
    const pocketTopAccessor = accessors.pocketCluster(component)
    const entries = Object.entries(component.pocketTopMapping)
    const remainingEntries = entries.filter(([key, topId]) => {
      const pocketNumber = Number(key)
      return (
        Number.isInteger(pocketNumber) &&
        pocketNumber >= 1 &&
        pocketNumber <= component.pocketCount &&
        topId !== component.defaultPocketTop.id &&
        isDefined(pocketTopAccessor.optional.pocketTop(topId))
      )
    })
    if (remainingEntries.length === entries.length) {
      return component
    }

    const pocketTopMapping: Partial<Record<number, string>> = Object.fromEntries(remainingEntries)
    const updatedComponent: PocketClusterSchema = { ...component, pocketTopMapping }
    return updatedComponent
  })
}
