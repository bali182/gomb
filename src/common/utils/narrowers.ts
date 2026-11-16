import type { ArcPathSegment, LinePathSegment, PathSegment } from '../logic/pathSegmentTypes'
import type { StitchHoleLineSegment, StitchHoleSegment } from '../logic/stitching/stitchHoleGeometry'
import type { BindingSchema } from '../schemas/bindings'
import type { HasTypeSchema } from '../schemas/common'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../schemas/components'
import type {
  ComputedComponentSchema,
  ComputedFrontPocketSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedRootPanelSchema,
  ComputedTPocketSchema,
  StitchCornerPathFragment,
  StitchPathFragment,
  StitchSidePathFragment,
} from '../schemas/computed'
import type {
  PathArcToSchema,
  PathCloseSchema,
  PathCommand,
  PathLineToSchema,
  PathMoveToSchema,
} from '../schemas/geometry'
import type { HoleSchema } from '../schemas/hole'
import type { IssueSchema } from '../schemas/issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from '../schemas/pocketOpening'
import type { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from '../schemas/stitching'
import type { SubProjectItemSchema } from '../schemas/subProject'
import { isRecord } from './isRecord'

export const narrowers = {
  is: {
    binding: (input: SubProjectItemSchema): input is BindingSchema => hasType(input, 'equal-binding'),
    // Component
    component: (input: SubProjectItemSchema): input is ComponentSchema => {
      return hasOneOfType(input, 'root-panel', 'panel', 'pocket-cluster', 'front-pocket', 't-pocket')
    },
    rootPanel: (input: SubProjectItemSchema): input is RootPanelSchema => {
      return hasType(input, 'root-panel')
    },
    panel: (input: SubProjectItemSchema): input is PanelSchema => {
      return hasType(input, 'panel')
    },
    pocketCluster: (input: SubProjectItemSchema): input is PocketClusterSchema => {
      return hasType(input, 'pocket-cluster')
    },
    pocket: (input: SubProjectItemSchema): input is PocketSchema => {
      return hasOneOfType(input, 'front-pocket', 't-pocket')
    },
    frontPocket: (input: SubProjectItemSchema): input is FrontPocketSchema => {
      return hasType(input, 'front-pocket')
    },
    tPocket: (input: SubProjectItemSchema): input is TPocketSchema => {
      return hasType(input, 't-pocket')
    },
    pocketOpening: (input: SubProjectItemSchema): input is PocketOpeningSchema => {
      return hasOneOfType(input, 'straight', 'slanted', 'recessed', 'optical-illusion')
    },
    straightPocketOpening: (input: PocketOpeningSchema): input is StraightPocketOpeningSchema => {
      return hasType(input, 'straight')
    },
    slantedPocketOpening: (input: PocketOpeningSchema): input is SlantedPocketOpeningSchema => {
      return hasType(input, 'slanted')
    },
    recessedPocketOpening: (input: PocketOpeningSchema): input is RecessedPocketOpeningSchema => {
      return hasType(input, 'recessed')
    },
    opticalIllusionPocketOpening: (input: PocketOpeningSchema): input is OpticalIllusionPocketOpeningSchema => {
      return hasType(input, 'optical-illusion')
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
    computedFrontPocket: (input: ComputedComponentSchema): input is ComputedFrontPocketSchema => {
      return hasType(input, 'computed-front-pocket')
    },
    computedTPocket: (input: ComputedComponentSchema): input is ComputedTPocketSchema => {
      return hasType(input, 'computed-t-pocket')
    },
    // Stitch line
    stitchLine: (input: SubProjectItemSchema): input is StitchLineSchema => {
      return hasOneOfType(input, 'component-bounds-stitch-line', 't-pocket-stitch-line')
    },
    componentBoundsStitchLine: (input: SubProjectItemSchema): input is ComponentBoundsStitchLineSchema => {
      return hasType(input, 'component-bounds-stitch-line')
    },
    tPocketStitchLine: (input: SubProjectItemSchema): input is TPocketStitchLineSchema => {
      return hasType(input, 't-pocket-stitch-line')
    },
    // Hole
    hole: (input: SubProjectItemSchema): input is HoleSchema => {
      return hasType(input, 'hole')
    },
    // Issue
    issue: (input: unknown): input is IssueSchema => {
      return (
        isRecord(input) &&
        typeof input.message === 'string' &&
        (input.severity === 'error' || input.severity === 'warning' || input.severity === 'info')
      )
    },
  },
  path: {
    is: {
      moveTo: (input: PathCommand): input is PathMoveToSchema => {
        return hasType(input, 'moveTo')
      },
      lineTo: (input: PathCommand): input is PathLineToSchema => {
        return hasType(input, 'lineTo')
      },
      arcTo: (input: PathCommand): input is PathArcToSchema => {
        return hasType(input, 'arcTo')
      },
      close: (input: PathCommand): input is PathCloseSchema => {
        return hasType(input, 'close')
      },
      lineSegment: (input: PathSegment): input is LinePathSegment => {
        return hasType(input, 'line')
      },
      arcSegment: (input: PathSegment): input is ArcPathSegment => {
        return hasType(input, 'arc')
      },
      stitchHoleLineSegment: (input: StitchHoleSegment): input is StitchHoleLineSegment => {
        return hasType(input, 'line')
      },
      sideFragment: <T extends StitchPathFragment>(input: T): input is T & StitchSidePathFragment => {
        return hasType(input, 'side')
      },
      cornerFragment: <T extends StitchPathFragment>(input: T): input is T & StitchCornerPathFragment => {
        return hasType(input, 'corner')
      },
    },
  },
  assert: {
    // Component
    rootPanel: (input: SubProjectItemSchema): RootPanelSchema => {
      return assertType(input, 'root-panel')
    },
    panel: (input: SubProjectItemSchema): PanelSchema => {
      return assertType(input, 'panel')
    },
    pocketCluster: (input: SubProjectItemSchema): PocketClusterSchema => {
      return assertType(input, 'pocket-cluster')
    },
    pocket: (input: SubProjectItemSchema): PocketSchema => {
      return assertOneOf(input, 'front-pocket', 't-pocket')
    },
    frontPocket: (input: SubProjectItemSchema): FrontPocketSchema => {
      return assertType(input, 'front-pocket')
    },
    tPocket: (input: SubProjectItemSchema): TPocketSchema => {
      return assertType(input, 't-pocket')
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
    computedFrontPocket: (input: ComputedComponentSchema): ComputedFrontPocketSchema => {
      return assertType(input, 'computed-front-pocket')
    },
    computedTPocket: (input: ComputedComponentSchema): ComputedTPocketSchema => {
      return assertType(input, 'computed-t-pocket')
    },
    // Stitch line
    componentBoundsStitchLine: (input: SubProjectItemSchema): ComponentBoundsStitchLineSchema => {
      return assertType(input, 'component-bounds-stitch-line')
    },
    tPocketStitchLine: (input: SubProjectItemSchema): TPocketStitchLineSchema => {
      return assertType(input, 't-pocket-stitch-line')
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
    throw new Error(`Expected type='${expectedType}', but was '${input.type}'.`)
  }
  return input
}

const hasOneOfType = <Data, CurrentType extends string, ExpectedTypes extends readonly [CurrentType, ...CurrentType[]]>(
  input: Data & HasTypeSchema<CurrentType>,
  ...expectedTypes: ExpectedTypes
): input is Data & HasTypeSchema<ExpectedTypes[number]> => {
  return expectedTypes.some((expectedType) => input.type === expectedType)
}

const assertOneOf = <Data, CurrentType extends string, ExpectedTypes extends readonly [CurrentType, ...CurrentType[]]>(
  input: Data & HasTypeSchema<CurrentType>,
  ...expectedTypes: ExpectedTypes
): Data & HasTypeSchema<ExpectedTypes[number]> => {
  if (!hasOneOfType(input, ...expectedTypes)) {
    throw new Error(`Expected type to be one of '${expectedTypes.join("', '")}', but was '${input.type}'.`)
  }
  return input
}
