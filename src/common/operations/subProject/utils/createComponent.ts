import { HasCornerRadiusSchema, HasIdentitySchema, HasOffAxisAnchor, HasSqueezeSchema } from '../../../schemas/common'
import {
  ComponentSchema,
  HasAutoDimensionsSchema,
  HasColorSchema,
  HasLayoutSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
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
  const common: HasColorSchema & HasIdentitySchema = { id, name, ...(isDefined(color) ? { color } : {}) }

  switch (type) {
    case 'panel': {
      return {
        ...DEFAULT_PANEL,
        ...common,
      }
    }
    case 'root-panel': {
      return {
        ...DEFAULT_ROOT_PANEL,
        ...common,
        ...getClosestRootDimensions(DEFAULT_ROOT_PANEL, stitchingSettings),
      }
    }
    case 'pocket-cluster': {
      return {
        ...DEFAULT_POCKET_CLUSTER,
        ...common,
        pocketStep: getClosestPocketStepSize(DEFAULT_POCKET_CLUSTER.pocketStep, stitchingSettings),
      }
    }
  }
}

const defaultHasCornerRadius: HasCornerRadiusSchema = {
  topLeftRadius: 0,
  bottomLeftRadius: 0,
  bottomRightRadius: 0,
  topRightRadius: 0,
  individualRadii: false,
}

const defaultHasLayout: HasLayoutSchema = {
  layoutOrientation: 'horizontal',
  layoutGap: 0,
  autoLayoutGap: false,
}

const defaultHasFillableSize: HasAutoDimensionsSchema = {
  width: 10,
  height: 10,
  autoHeight: true,
  autoWidth: true,
}

const defaultHasOffAxisAnchor: HasOffAxisAnchor = {
  offAxisAnchor: 'middle',
}

const defaultHasSqueeze: HasSqueezeSchema = {
  individualSqueeze: true,
  topSqueeze: 0,
  rightSqueeze: 0,
  bottomSqueeze: 0,
  leftSqueeze: 0,
}

const DEFAULT_ROOT_PANEL: RootPanelSchema = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  type: 'root-panel',
  id: '',
  name: '',
  children: [],
  width: 160,
  height: 110,
}

const DEFAULT_PANEL: PanelSchema = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasSqueeze,
  type: 'panel',
  id: '',
  name: '',
  children: [],
}

const DEFAULT_POCKET_CLUSTER: PocketClusterSchema = {
  ...defaultHasLayout,
  ...defaultHasCornerRadius,
  ...defaultHasFillableSize,
  ...defaultHasOffAxisAnchor,
  ...defaultHasSqueeze,
  type: 'pocket-cluster',
  id: '',
  name: '',
  children: [],
  orientation: 'up',
  pocketCount: 3,
  pocketStep: 10,
  tPocketTabWidth: 8,
  tPocketTaper: 20,
}
