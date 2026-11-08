import { ComponentInsertionPositionSchema } from '../../../schemas/operations'

export const getInsertionIndex = (position: ComponentInsertionPositionSchema, childCount: number): number => {
  switch (position) {
    case 'start':
      return 0
    case 'end':
      return childCount
    default:
      return position
  }
}
