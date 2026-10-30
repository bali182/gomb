import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketOpeningSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ProjectSchema } from '../schemas/project'
import type { ColorSettingsSchema } from '../schemas/settings'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineCommonConfigSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from './accessors'
import { isDefined } from './isDefined'
import { narrowers } from './narrowers'

export const comparators = {
  project: (a: ProjectSchema, b: ProjectSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      comparators.stitchingSettings(a.stitchingSettings, b.stitchingSettings) &&
      comparators.colorSettings(a.colorSettings, b.colorSettings) &&
      areArraysEqual(a.subProjects, b.subProjects, comparators.subProject)
    )
  },
  stitchingSettings: (a: StitchLineCommonConfigSchema, b: StitchLineCommonConfigSchema): boolean => {
    return (
      a.stitchMargin === b.stitchMargin &&
      a.stitchHoleLength === b.stitchHoleLength &&
      a.stitchHoleDistance === b.stitchHoleDistance &&
      a.stitchHoleThickness === b.stitchHoleThickness &&
      a.stitchLineThickness === b.stitchLineThickness
    )
  },
  colorSettings: (a: ColorSettingsSchema, b: ColorSettingsSchema): boolean => {
    return (
      a.leatherColor === b.leatherColor &&
      a.stitchHoleColor === b.stitchHoleColor &&
      a.stitchLineColor === b.stitchLineColor &&
      a.strokeColor === b.strokeColor &&
      a.selectionColor === b.selectionColor &&
      a.pocketItemColor === b.pocketItemColor &&
      a.threadColor === b.threadColor
    )
  },

  subProject: (a: SubProjectSchema, b: SubProjectSchema): boolean => {
    const accessor = accessors.subProject(b)
    return (
      a.id === b.id &&
      a.root === b.root &&
      Object.keys(a.components).length === Object.keys(b.components).length &&
      Object.entries(a.components).every(
        ([id, component]) => id in b.components && comparators.component(component, accessor.component(id)),
      ) &&
      areArraysEqual(a.holes, b.holes, comparators.hole) &&
      areArraysEqual(a.stitchLines, b.stitchLines, comparators.stitchLine)
    )
  },

  component: (a: ComponentSchema, b: ComponentSchema): boolean => {
    if (a.type !== b.type) {
      return false
    }

    if (narrowers.is.rootPanel(a) && narrowers.is.rootPanel(b)) {
      return comparators.rootPanel(a, b)
    }

    if (narrowers.is.panel(a) && narrowers.is.panel(b)) {
      return comparators.panel(a, b)
    }

    if (narrowers.is.pocketCluster(a) && narrowers.is.pocketCluster(b)) {
      return comparators.pocketCluster(a, b)
    }

    if (narrowers.is.frontPocket(a) && narrowers.is.frontPocket(b)) {
      return comparators.frontPocket(a, b)
    }
    if (narrowers.is.tPocket(a) && narrowers.is.tPocket(b)) {
      return comparators.tPocket(a, b)
    }
    return false
  },
  rootPanel: (a: RootPanelSchema, b: RootPanelSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.layoutOrientation === b.layoutOrientation &&
      a.layoutGap === b.layoutGap &&
      a.autoLayoutGap === b.autoLayoutGap &&
      areArraysEqual(a.children, b.children, (first, second) => first === second) &&
      a.width === b.width &&
      a.height === b.height
    )
  },
  panel: (a: PanelSchema, b: PanelSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.layoutOrientation === b.layoutOrientation &&
      a.layoutGap === b.layoutGap &&
      a.autoLayoutGap === b.autoLayoutGap &&
      a.offAxisAnchor === b.offAxisAnchor &&
      areArraysEqual(a.children, b.children, (first, second) => first === second) &&
      a.width === b.width &&
      a.height === b.height &&
      a.autoWidth === b.autoWidth &&
      a.autoHeight === b.autoHeight &&
      a.individualStretch === b.individualStretch &&
      a.topStretch === b.topStretch &&
      a.rightStretch === b.rightStretch &&
      a.bottomStretch === b.bottomStretch &&
      a.leftStretch === b.leftStretch
    )
  },
  pocketOpening: (a: PocketOpeningSchema, b: PocketOpeningSchema): boolean => {
    if (narrowers.is.opticalIllusionPocketOpening(a) && narrowers.is.opticalIllusionPocketOpening(b)) {
      return (
        a.direction === b.direction &&
        a.startInset === b.startInset &&
        a.endInset === b.endInset &&
        a.leadingRadius === b.leadingRadius &&
        a.trailingRadius === b.trailingRadius
      )
    }
    if (narrowers.is.straightPocketOpening(a) && narrowers.is.straightPocketOpening(b)) {
      return true
    }
    if (narrowers.is.slantedPocketOpening(a) && narrowers.is.slantedPocketOpening(b)) {
      return a.offset === b.offset && a.side === b.side
    }
    if (narrowers.is.recessedPocketOpening(a) && narrowers.is.recessedPocketOpening(b)) {
      return (
        a.outerInset === b.outerInset &&
        a.innerOffset === b.innerOffset &&
        a.depth === b.depth &&
        a.outerRadius === b.outerRadius &&
        a.innerRadius === b.innerRadius
      )
    }
    return false
  },
  frontPocket: (a: FrontPocketSchema, b: FrontPocketSchema): boolean =>
    a.id === b.id &&
    a.name === b.name &&
    a.color === b.color &&
    a.layoutOrientation === b.layoutOrientation &&
    a.layoutGap === b.layoutGap &&
    a.autoLayoutGap === b.autoLayoutGap &&
    a.individualRadii === b.individualRadii &&
    a.topLeftRadius === b.topLeftRadius &&
    a.topRightRadius === b.topRightRadius &&
    a.bottomLeftRadius === b.bottomLeftRadius &&
    a.bottomRightRadius === b.bottomRightRadius &&
    areArraysEqual(a.children, b.children, (first, second) => first === second) &&
    a.itemId === b.itemId &&
    a.itemOrientation === b.itemOrientation &&
    a.itemCrossAxisOffset === b.itemCrossAxisOffset &&
    a.itemOpeningOffset === b.itemOpeningOffset &&
    comparators.pocketOpening(a.opening, b.opening),
  tPocket: (a: TPocketSchema, b: TPocketSchema): boolean =>
    a.id === b.id &&
    a.name === b.name &&
    a.color === b.color &&
    a.tPocketTabWidth === b.tPocketTabWidth &&
    a.tPocketTaper === b.tPocketTaper &&
    areArraysEqual(a.children, b.children, (first, second) => first === second) &&
    a.itemId === b.itemId &&
    a.itemOrientation === b.itemOrientation &&
    a.itemCrossAxisOffset === b.itemCrossAxisOffset &&
    a.itemOpeningOffset === b.itemOpeningOffset &&
    comparators.pocketOpening(a.opening, b.opening),
  pocketCluster: (a: PocketClusterSchema, b: PocketClusterSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.offAxisAnchor === b.offAxisAnchor &&
      a.width === b.width &&
      a.height === b.height &&
      a.autoWidth === b.autoWidth &&
      a.autoHeight === b.autoHeight &&
      a.individualStretch === b.individualStretch &&
      a.topStretch === b.topStretch &&
      a.rightStretch === b.rightStretch &&
      a.bottomStretch === b.bottomStretch &&
      a.leftStretch === b.leftStretch &&
      areArraysEqual(a.children, b.children, (first, second) => first === second) &&
      a.pocketStep === b.pocketStep &&
      a.orientation === b.orientation
    )
  },

  hole: (a: HoleSchema, b: HoleSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.componentId === b.componentId &&
      a.xAnchor === b.xAnchor &&
      a.yAnchor === b.yAnchor &&
      a.xOffset === b.xOffset &&
      a.yOffset === b.yOffset &&
      a.width === b.width &&
      a.height === b.height &&
      a.bottomRightRadius === b.bottomRightRadius
    )
  },

  stitchLine: (a: StitchLineSchema, b: StitchLineSchema): boolean => {
    if (a.type !== b.type) {
      return false
    }

    if (narrowers.is.componentBoundsStitchLine(a) && narrowers.is.componentBoundsStitchLine(b)) {
      return comparators.componentBoundsStitchLine(a, b)
    }

    if (narrowers.is.tPocketStitchLine(a) && narrowers.is.tPocketStitchLine(b)) {
      return comparators.tPocketStitchLine(a, b)
    }

    return false
  },
  componentBoundsStitchLine: (a: ComponentBoundsStitchLineSchema, b: ComponentBoundsStitchLineSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.targetType === b.targetType &&
      a.targetId === b.targetId &&
      a.stitchMargin === b.stitchMargin &&
      a.stitchHoleLength === b.stitchHoleLength &&
      a.stitchHoleDistance === b.stitchHoleDistance &&
      a.stitchHoleThickness === b.stitchHoleThickness &&
      a.stitchLineThickness === b.stitchLineThickness &&
      a.topStartOffset === b.topStartOffset &&
      a.topEndOffset === b.topEndOffset &&
      a.rightStartOffset === b.rightStartOffset &&
      a.rightEndOffset === b.rightEndOffset &&
      a.bottomStartOffset === b.bottomStartOffset &&
      a.bottomEndOffset === b.bottomEndOffset &&
      a.leftStartOffset === b.leftStartOffset &&
      a.leftEndOffset === b.leftEndOffset &&
      a.autoCornerRadius === b.autoCornerRadius &&
      a.individualRadii === b.individualRadii &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
      a.topStitchDirection === b.topStitchDirection &&
      a.bottomStitchDirection === b.bottomStitchDirection &&
      a.rightStitchDirection === b.rightStitchDirection &&
      a.leftStitchDirection === b.leftStitchDirection &&
      a.top === b.top &&
      a.right === b.right &&
      a.bottom === b.bottom &&
      a.left === b.left &&
      a.topLeftCorner === b.topLeftCorner &&
      a.topRightCorner === b.topRightCorner &&
      a.bottomRightCorner === b.bottomRightCorner &&
      a.bottomLeftCorner === b.bottomLeftCorner
    )
  },
  tPocketStitchLine: (a: TPocketStitchLineSchema, b: TPocketStitchLineSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.targetType === b.targetType &&
      a.targetId === b.targetId &&
      a.stitchMargin === b.stitchMargin &&
      a.stitchHoleLength === b.stitchHoleLength &&
      a.stitchHoleDistance === b.stitchHoleDistance &&
      a.stitchHoleThickness === b.stitchHoleThickness &&
      a.stitchLineThickness === b.stitchLineThickness &&
      a.startOffset === b.startOffset &&
      a.endOffset === b.endOffset &&
      a.stitchDirection === b.stitchDirection
    )
  },
}

type OptionalComparators<T> = {
  [Key in keyof T]: T[Key] extends (first: infer Value, second: infer Value) => boolean
    ? (first: Value | null | undefined, second: Value | null | undefined) => boolean
    : never
}

const areArraysEqual = <T>(a: readonly T[], b: readonly T[], comparator: (a: T, b: T) => boolean): boolean => {
  return a.length === b.length && a.every((value, index) => comparator(value, b[index]))
}

const createOptionalComparators = <T extends Record<string, (first: never, second: never) => boolean>>(
  comparators: T,
): OptionalComparators<T> => {
  return Object.fromEntries(
    Object.entries(comparators).map(([key, comparator]) => [
      key,
      (first: never | null | undefined, second: never | null | undefined): boolean => {
        if (!isDefined(first) || !isDefined(second)) {
          return first === second
        }

        return comparator(first as never, second as never)
      },
    ]),
  ) as OptionalComparators<T>
}

export const optionalComparators = createOptionalComparators(comparators)
