import type { HasTypeSchema } from '../schemas/common'
import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type {
  ComputedComponentSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedRootPanelSchema,
} from '../schemas/computed'
import type { HoleSchema } from '../schemas/hole'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type {
  ComponentBoundsStitchLineSchema,
  PocketClusterStitchLineSchema,
  StitchLineSchema,
} from '../schemas/stitching'

export const narrowers = {
  is: {
    // Component
    component: (input: ModelObjectSchema): input is ComponentSchema => {
      return hasType(input, 'root-panel') || hasType(input, 'panel') || hasType(input, 'pocket-cluster')
    },
    rootPanel: (input: ModelObjectSchema): input is RootPanelSchema => {
      return hasType(input, 'root-panel')
    },
    panel: (input: ModelObjectSchema): input is PanelSchema => {
      return hasType(input, 'panel')
    },
    pocketCluster: (input: ModelObjectSchema): input is PocketClusterSchema => {
      return hasType(input, 'pocket-cluster')
    },
    // Computed component
    computedRootPanel: (input: ComputedComponentSchema): input is ComputedRootPanelSchema => {
      return hasType(input, 'computed-root-panel')
    },
    computedPanel: (input: ComputedComponentSchema): input is ComputedPanelSchema => {
      return hasType(input, 'computed-panel')
    },
    computedPocketCluster: (input: ComputedComponentSchema): input is ComputedPocketClusterSchema => {
      return hasType(input, 'computed-pocket-cluster')
    },
    // Stitch line
    stitchLine: (input: ModelObjectSchema): input is StitchLineSchema => {
      return hasType(input, 'component-bounds-stitch-line') || hasType(input, 'pocket-cluster-stitch-line')
    },
    componentBoundsStitchLine: (input: ModelObjectSchema): input is ComponentBoundsStitchLineSchema => {
      return hasType(input, 'component-bounds-stitch-line')
    },
    pocketClusterStitchLine: (input: ModelObjectSchema): input is PocketClusterStitchLineSchema => {
      return hasType(input, 'pocket-cluster-stitch-line')
    },
    // Hole
    hole: (input: ModelObjectSchema): input is HoleSchema => {
      return hasType(input, 'hole')
    },
  },
  assert: {
    // Component
    rootPanel: (input: ModelObjectSchema): RootPanelSchema => {
      return assertType(input, 'root-panel')
    },
    panel: (input: ModelObjectSchema): PanelSchema => {
      return assertType(input, 'panel')
    },
    pocketCluster: (input: ModelObjectSchema): PocketClusterSchema => {
      return assertType(input, 'pocket-cluster')
    },
    // Computed component
    computedRootPanel: (input: ComputedComponentSchema): ComputedRootPanelSchema => {
      return assertType(input, 'computed-root-panel')
    },
    computedPanel: (input: ComputedComponentSchema): ComputedPanelSchema => {
      return assertType(input, 'computed-panel')
    },
    computedPocketCluster: (input: ComputedComponentSchema): ComputedPocketClusterSchema => {
      return assertType(input, 'computed-pocket-cluster')
    },
    // Stitch line
    componentBoundsStitchLine: (input: ModelObjectSchema): ComponentBoundsStitchLineSchema => {
      return assertType(input, 'component-bounds-stitch-line')
    },
    pocketClusterStitchLine: (input: ModelObjectSchema): PocketClusterStitchLineSchema => {
      return assertType(input, 'pocket-cluster-stitch-line')
    },
  },
}

const hasType = <Data, CurrentType extends string, ExpectedType extends CurrentType>(
  input: Data & HasTypeSchema<CurrentType>,
  expectedType: ExpectedType,
): input is Data & HasTypeSchema<ExpectedType> => {
  return input.type === expectedType
}

const assertType = <Data, CurrentType extends string, ExpectedType extends CurrentType>(
  input: Data & HasTypeSchema<CurrentType>,
  expectedType: ExpectedType,
): Data & HasTypeSchema<ExpectedType> => {
  if (!hasType(input, expectedType)) {
    throw new Error(`Excpected type='${expectedType}', but was '${input.type}'.`)
  }
  return input
}
