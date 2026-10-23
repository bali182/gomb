import {
  defaultFrontPocket,
  defaultPanel,
  defaultPocketCluster,
  defaultRootPanel,
  defaultTPocket,
} from '../../../defaultStates'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../../schemas/components'
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
  switch (type) {
    case 'front-pocket': {
      const component: FrontPocketSchema = {
        ...defaultFrontPocket,
        id,
        name,
        ...(isDefined(color) ? { color } : {}),
      }
      return component
    }
    case 't-pocket': {
      const component: TPocketSchema = {
        ...defaultTPocket,
        id,
        name,
        ...(isDefined(color) ? { color } : {}),
      }
      return component
    }
    case 'panel': {
      const component: PanelSchema = {
        ...defaultPanel,
        id,
        name,
        ...(isDefined(color) ? { color } : {}),
      }
      return component
    }
    case 'root-panel': {
      const component: RootPanelSchema = {
        ...defaultRootPanel,
        id,
        name,
        ...(isDefined(color) ? { color } : {}),
        ...getClosestRootDimensions(defaultRootPanel, stitchingSettings),
      }
      return component
    }
    case 'pocket-cluster': {
      const component: PocketClusterSchema = {
        ...defaultPocketCluster,
        id,
        name,
        ...(isDefined(color) ? { color } : {}),
        pocketStep: getClosestPocketStepSize(defaultPocketCluster.pocketStep, stitchingSettings),
      }
      return component
    }
  }
}
