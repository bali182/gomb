import { ComponentSchema } from '../../schemas/components'
import { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

export type ComponentInsertionPositionSchema = 'start' | 'end' | number

export type AddComponentParams = {
  parentId: string
  component: ComponentSchema
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
  return {
    ...subProject,
    components: {
      ...subProject.components,
      [parent.id]: {
        ...parent,
        children: [
          ...parent.children.slice(0, insertionIndex),
          params.component.id,
          ...parent.children.slice(insertionIndex),
        ],
      },
      [params.component.id]: params.component,
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
