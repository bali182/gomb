import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ProjectSchema } from '../schemas/project'
import type { ColorSettingsSchema } from '../schemas/settings'
import type {
  ComponentBoundsStitchLineSchema,
  PocketClusterStitchLineSchema,
  StitchLineCommonConfigSchema,
  StitchLineSchema,
} from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { isDefined } from './isDefined'

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
      a.cardColor === b.cardColor &&
      a.threadColor === b.threadColor
    )
  },

  subProject: (a: SubProjectSchema, b: SubProjectSchema): boolean => {
    return (
      a.id === b.id &&
      a.root === b.root &&
      Object.keys(a.components).length === Object.keys(b.components).length &&
      Object.entries(a.components).every(
        ([id, component]) => id in b.components && comparators.component(component, b.components[id]),
      ) &&
      areArraysEqual(a.holes, b.holes, comparators.hole) &&
      areArraysEqual(a.stitchLines, b.stitchLines, comparators.stitchLine)
    )
  },

  component: (a: ComponentSchema, b: ComponentSchema): boolean => {
    if (a.type !== b.type) {
      return false
    }

    if (a.type === 'root-panel' && b.type === 'root-panel') {
      return comparators.rootPanel(a, b)
    }

    if (a.type === 'panel' && b.type === 'panel') {
      return comparators.panel(a, b)
    }

    if (a.type === 'pocket-cluster' && b.type === 'pocket-cluster') {
      return comparators.pocketCluster(a, b)
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
      a.individualRadii === b.individualRadii &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
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
      a.individualRadii === b.individualRadii &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
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
  pocketCluster: (a: PocketClusterSchema, b: PocketClusterSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.offAxisAnchor === b.offAxisAnchor &&
      a.individualRadii === b.individualRadii &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
      a.width === b.width &&
      a.height === b.height &&
      a.autoWidth === b.autoWidth &&
      a.autoHeight === b.autoHeight &&
      a.individualStretch === b.individualStretch &&
      a.topStretch === b.topStretch &&
      a.rightStretch === b.rightStretch &&
      a.bottomStretch === b.bottomStretch &&
      a.leftStretch === b.leftStretch &&
      a.pocketCount === b.pocketCount &&
      a.pocketStep === b.pocketStep &&
      a.orientation === b.orientation &&
      a.tPocketTabWidth === b.tPocketTabWidth &&
      a.tPocketTaper === b.tPocketTaper &&
      a.cardId === b.cardId &&
      a.cardCrossAxisOffset === b.cardCrossAxisOffset &&
      a.cardOpeningOffset === b.cardOpeningOffset
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
      a.individualRadii === b.individualRadii &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius
    )
  },

  stitchLine: (a: StitchLineSchema, b: StitchLineSchema): boolean => {
    if (a.type !== b.type) {
      return false
    }

    if (a.type === 'component-bounds-stitch-line' && b.type === 'component-bounds-stitch-line') {
      return comparators.componentBoundsStitchLine(a, b)
    }

    if (a.type === 'pocket-cluster-stitch-line' && b.type === 'pocket-cluster-stitch-line') {
      return comparators.pocketClusterStitchLine(a, b)
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
  pocketClusterStitchLine: (a: PocketClusterStitchLineSchema, b: PocketClusterStitchLineSchema): boolean => {
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
