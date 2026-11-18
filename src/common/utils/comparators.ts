import type { BindingFieldSchema, BindingSchema } from '../schemas/bindings'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelFaceSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
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
      a.defaultPocketOpening === b.defaultPocketOpening &&
      Object.keys(a.bindings).length === Object.keys(b.bindings).length &&
      Object.entries(a.bindings).every(
        ([id, binding]) => id in b.bindings && comparators.binding(binding, b.bindings[id]),
      ) &&
      Object.keys(a.pocketOpenings).length === Object.keys(b.pocketOpenings).length &&
      Object.entries(a.pocketOpenings).every(
        ([id, opening]) =>
          id in b.pocketOpenings && comparators.pocketOpening(opening, accessor.pocketOpening.byId(id)),
      ) &&
      Object.keys(a.components).length === Object.keys(b.components).length &&
      Object.entries(a.components).every(
        ([id, component]) => id in b.components && comparators.component(component, accessor.component.byId(id)),
      ) &&
      areArraysEqual(a.holes, b.holes, comparators.hole) &&
      areArraysEqual(a.stitchLines, b.stitchLines, comparators.stitchLine)
    )
  },

  binding: (a: BindingSchema, b: BindingSchema): boolean => {
    return a.id === b.id && a.type === b.type && areArraysEqual(a.fields, b.fields, comparators.bindingField)
  },
  bindingField: (a: BindingFieldSchema, b: BindingFieldSchema): boolean => {
    return a.id === b.id && a.type === b.type && a.modelId === b.modelId && a.field === b.field
  },

  component: (a: ComponentSchema, b: ComponentSchema): boolean => {
    if (a.type !== b.type) {
      return false
    }

    if (narrowers.is.rootPanel(a) && narrowers.is.rootPanel(b)) {
      return comparators.rootPanel(a, b)
    }

    if (narrowers.is.rootPanelFace(a) && narrowers.is.rootPanelFace(b)) {
      return comparators.rootPanelFace(a, b)
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
  rootPanelFace: (a: RootPanelFaceSchema, b: RootPanelFaceSchema): boolean => {
    return (
      a.id === b.id &&
      a.layoutOrientation === b.layoutOrientation &&
      a.mainAxisAnchor === b.mainAxisAnchor &&
      a.layoutGap === b.layoutGap &&
      a.autoLayoutGap === b.autoLayoutGap &&
      areArraysEqual(a.children, b.children, (first, second) => first === second)
    )
  },
  rootPanel: (a: RootPanelSchema, b: RootPanelSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.frontFaceId === b.frontFaceId &&
      a.backFaceId === b.backFaceId &&
      a.width === b.width &&
      a.height === b.height &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius
    )
  },
  panel: (a: PanelSchema, b: PanelSchema): boolean => {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.color === b.color &&
      a.layoutOrientation === b.layoutOrientation &&
      a.mainAxisAnchor === b.mainAxisAnchor &&
      a.layoutGap === b.layoutGap &&
      a.autoLayoutGap === b.autoLayoutGap &&
      a.offAxisAnchor === b.offAxisAnchor &&
      areArraysEqual(a.children, b.children, (first, second) => first === second) &&
      a.width === b.width &&
      a.height === b.height &&
      a.autoWidth === b.autoWidth &&
      a.autoHeight === b.autoHeight &&
      a.topStretch === b.topStretch &&
      a.rightStretch === b.rightStretch &&
      a.bottomStretch === b.bottomStretch &&
      a.leftStretch === b.leftStretch &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius
    )
  },
  pocketOpening: (a: PocketOpeningSchema, b: PocketOpeningSchema): boolean => {
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (narrowers.is.opticalIllusionPocketOpening(a) && narrowers.is.opticalIllusionPocketOpening(b)) {
      return (
        a.illusionSide === b.illusionSide &&
        a.illusionStartInset === b.illusionStartInset &&
        a.illusionEndInset === b.illusionEndInset &&
        a.illusionLeadingRadius === b.illusionLeadingRadius &&
        a.illusionTrailingRadius === b.illusionTrailingRadius
      )
    }
    if (narrowers.is.straightPocketOpening(a) && narrowers.is.straightPocketOpening(b)) {
      return true
    }
    if (narrowers.is.slantedPocketOpening(a) && narrowers.is.slantedPocketOpening(b)) {
      return a.slantOffset === b.slantOffset && a.slantSide === b.slantSide
    }
    if (narrowers.is.recessedPocketOpening(a) && narrowers.is.recessedPocketOpening(b)) {
      return (
        a.recessOuterInset === b.recessOuterInset &&
        a.recessInnerOffset === b.recessInnerOffset &&
        a.recessDepth === b.recessDepth &&
        a.recessOuterRadius === b.recessOuterRadius &&
        a.recessInnerRadius === b.recessInnerRadius
      )
    }
    return false
  },
  frontPocket: (a: FrontPocketSchema, b: FrontPocketSchema): boolean =>
    a.id === b.id &&
    a.name === b.name &&
    a.color === b.color &&
    a.layoutOrientation === b.layoutOrientation &&
    a.mainAxisAnchor === b.mainAxisAnchor &&
    a.layoutGap === b.layoutGap &&
    a.autoLayoutGap === b.autoLayoutGap &&
    a.topLeftRadius === b.topLeftRadius &&
    a.topRightRadius === b.topRightRadius &&
    a.bottomLeftRadius === b.bottomLeftRadius &&
    a.bottomRightRadius === b.bottomRightRadius &&
    areArraysEqual(a.children, b.children, (first, second) => first === second) &&
    a.itemId === b.itemId &&
    a.itemOrientation === b.itemOrientation &&
    a.itemCrossAxisOffset === b.itemCrossAxisOffset &&
    a.itemOpeningOffset === b.itemOpeningOffset &&
    a.openingId === b.openingId,
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
    a.openingId === b.openingId,
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
      a.topStretch === b.topStretch &&
      a.rightStretch === b.rightStretch &&
      a.bottomStretch === b.bottomStretch &&
      a.leftStretch === b.leftStretch &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
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
      a.onTop === b.onTop &&
      a.stitchMargin === b.stitchMargin &&
      a.stitchHoleLength === b.stitchHoleLength &&
      a.stitchHoleDistance === b.stitchHoleDistance &&
      a.stitchHoleThickness === b.stitchHoleThickness &&
      a.stitchLineThickness === b.stitchLineThickness &&
      a.autoCornerRadius === b.autoCornerRadius &&
      a.topLeftRadius === b.topLeftRadius &&
      a.topRightRadius === b.topRightRadius &&
      a.bottomLeftRadius === b.bottomLeftRadius &&
      a.bottomRightRadius === b.bottomRightRadius &&
      a.startOffset === b.startOffset &&
      a.endOffset === b.endOffset &&
      a.stitchDirection === b.stitchDirection &&
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
