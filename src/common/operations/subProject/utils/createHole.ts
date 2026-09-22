import { defaultHole } from '../../../defaultStates'
import type { HoleSchema } from '../../../schemas/hole'

type CreateHoleParams = {
  id: string
  componentId: string
  name: string
}

export const createHole = (params: CreateHoleParams): HoleSchema => {
  return {
    ...defaultHole,
    componentId: params.componentId,
    id: params.id,
    name: params.name,
  }
}
