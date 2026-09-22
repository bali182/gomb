import { defaultPanel, defaultPocketCluster, defaultRootPanel } from '../../../defaultStates'
import { HasIdentitySchema } from '../../../schemas/common'
import { ComponentSchema, HasColorSchema } from '../../../schemas/components'
import { StitchLineCommonConfigSchema } from '../../../schemas/stitching'
import { isDefined } from '../../../utils/isDefined'
import { getClosestPocketStepSize, getClosestRootDimensions } from './dimensionUtils'

type CreateComponentParams<T extends ComponentSchema> = {
  type: T['type']
  id: string
  name: string
  color?: string
  stitchingSettings: StitchLineCommonConfigSchema
}

export const createComponent = <T extends ComponentSchema>(params: CreateComponentParams<T>): T => {
  return createComponentRaw(params) as T
}

const createComponentRaw = ({
  type,
  color,
  id,
  name,
  stitchingSettings,
}: CreateComponentParams<ComponentSchema>): ComponentSchema => {
  const common: HasColorSchema & HasIdentitySchema = { id, name, ...(isDefined(color) ? { color } : {}) }

  switch (type) {
    case 'panel': {
      return {
        ...defaultPanel,
        ...common,
      }
    }
    case 'root-panel': {
      return {
        ...defaultRootPanel,
        ...common,
        ...getClosestRootDimensions(defaultRootPanel, stitchingSettings),
      }
    }
    case 'pocket-cluster': {
      return {
        ...defaultPocketCluster,
        ...common,
        pocketStep: getClosestPocketStepSize(defaultPocketCluster.pocketStep, stitchingSettings),
      }
    }
  }
}
