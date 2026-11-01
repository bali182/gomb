import { ComponentSchema, HasAutoDimensionsSchema, HasChildrenSchema, HasLayoutSchema } from '../schemas/components'
import { ComputedPanelSchema, ComputedPocketClusterSchema, HasComputedLayoutGapSchema } from '../schemas/computed'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
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
          return updateAutoLayoutGapComponent(component, narrowers.assert.computedFrontPocket(computedComponent))
        case 'root-panel': {
          const computedRootPanel = narrowers.assert.computedRootPanel(computedComponent)
          return updateAutoLayoutGapComponent(component, computedRootPanel)
        }
        case 'panel': {
          const computedPanel = narrowers.assert.computedPanel(computedComponent)
          return updateAutoLayoutGapComponent(updateAutoSizeComponent(component, computedPanel), computedPanel)
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
  computed: ComputedPanelSchema | ComputedPocketClusterSchema,
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
): T => {
  const layoutGap = computed.computedLayoutGap.toNumber()

  if (!component.autoLayoutGap || component.children.length < 2 || layoutGap === component.layoutGap) {
    return component
  }

  return { ...component, layoutGap }
}
