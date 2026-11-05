import { ComponentSchema, type HasColorSchema } from '../../schemas/components'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { isDefined } from '../../utils/isDefined'

export type ComponentInsertionPositionSchema = 'start' | 'end' | number

export type AddComponentParams = HasColorSchema & {
  parentId: string
  type: ComponentSchema['type']
  stitchingSettings: StitchLineCommonConfigSchema
  modelFactory: ReadonlyModelObjectFactorySchema
  position: ComponentInsertionPositionSchema
}

export const addComponent = (subProject: SubProjectSchema, params: AddComponentParams): SubProjectSchema => {
  const parent = accessors.subProject(subProject).optional.component.byId(params.parentId)

  if (!isDefined(parent)) {
    throw new Error('Missing parent')
  }

  const insertionIndex = getInsertionIndex(params.position, parent.children.length)
  if (!Number.isInteger(insertionIndex) || insertionIndex < 0 || insertionIndex > parent.children.length) {
    return subProject
  }
  const component = params.modelFactory.createComponent({
    type: params.type,
    color: params.color,
    stitchingSettings: params.stitchingSettings,
    openingId: subProject.defaultPocketOpening,
    forbiddenIds: getSubProjectIds(subProject),
    forbiddenNames: new Set(Object.values(subProject.components).map((component) => component.name)),
  })
  return {
    ...subProject,
    components: {
      ...subProject.components,
      [parent.id]: {
        ...parent,
        children: [...parent.children.slice(0, insertionIndex), component.id, ...parent.children.slice(insertionIndex)],
      },
      [component.id]: component,
    },
  }
}

const getInsertionIndex = (position: ComponentInsertionPositionSchema, childCount: number): number => {
  switch (position) {
    case 'start':
      return 0
    case 'end':
      return childCount
    default:
      return position
  }
}
