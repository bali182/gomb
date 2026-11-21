import { HasAutoDimensionsSchema } from '../schemas/common'
import type { ComponentSchema, HasChildrenSchema, HasLayoutSchema } from '../schemas/components'
import type {
  ComputedGuideSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  HasComputedLayoutGapSchema,
} from '../schemas/computed'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'
import { updateComponents } from '../utils/updateComponents'

export const addComputedSizes = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  return updateComponents({
    subProject,
    computedSubProject: computedProject,
    mapper: (_id, component, computedComponent) => {
      switch (component.type) {
        case 't-pocket':
          return component
        case 'front-pocket':
          return updateAutoLayoutGapComponent(
            component,
            narrowers.assert.computedFrontPocket(computedComponent),
            subProject,
          )
        case 'root-panel':
          return component
        case 'root-panel-face': {
          return updateAutoLayoutGapComponent(
            component,
            narrowers.assert.computedRootPanelFace(computedComponent),
            subProject,
          )
        }
        case 'guide': {
          const computedGuide = narrowers.assert.computedGuide(computedComponent)
          return updateAutoLayoutGapComponent(
            updateAutoSizeComponent(component, computedGuide),
            computedGuide,
            subProject,
          )
        }
        case 'panel': {
          const computedPanel = narrowers.assert.computedPanel(computedComponent)
          return updateAutoLayoutGapComponent(
            updateAutoSizeComponent(component, computedPanel),
            computedPanel,
            subProject,
          )
        }
        case 'pocket-cluster': {
          const computedCluster = narrowers.assert.computedPocketCluster(computedComponent)
          return updateAutoSizeComponent(component, computedCluster)
        }
      }
    },
  })
}

type AutoSizeComponent = ComponentSchema & HasAutoDimensionsSchema

const updateAutoSizeComponent = <T extends AutoSizeComponent>(
  component: T,
  computed: ComputedPanelSchema | ComputedPocketClusterSchema | ComputedGuideSchema,
): T => {
  const width = component.autoWidth ? computed.layoutBoundingRect.width.toNumber() : component.width
  const height = component.autoHeight ? computed.layoutBoundingRect.height.toNumber() : component.height

  if (width === component.width && height === component.height) {
    return component
  }

  return { ...component, width, height }
}

type LayoutedComponent = ComponentSchema & HasLayoutSchema & HasChildrenSchema

const updateAutoLayoutGapComponent = <T extends LayoutedComponent, C extends HasComputedLayoutGapSchema>(
  component: T,
  computed: C,
  subProject: SubProjectSchema,
): T => {
  const layoutGap = computed.computedLayoutGap.toNumber()

  if (
    !component.autoLayoutGap ||
    accessors
      .subProject(subProject)
      .component.children(component.id)
      .filter((child) => narrowers.is.panel(child) || narrowers.is.pocketCluster(child)).length < 2 ||
    layoutGap === component.layoutGap
  ) {
    return component
  }

  return { ...component, layoutGap }
}
