import type { ComponentSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculatePocketClusterStitchLine } from './calculatePocketClusterStitchLine'

export const calculateStitchLine = (
  stitchLine: ResolvedStitchLineSchema,
  component: ComponentSchema,
  computedComponent: ComputedComponentSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedStitchLineSchema => {
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line': {
      return calculateComponentBoundsStitchLine(
        stitchLine,
        {
          componentId: computedComponent.componentId,
          boundingRect: computedComponent.boundingRect,
          cornerRadius: computedComponent.cornerRadius,
        },
        computedComponents,
      )
    }
    case 'pocket-cluster-stitch-line': {
      if (component.type !== 'pocket-cluster') {
        throw new Error('Pocket cluster stitch line requires a pocket cluster component')
      }
      if (computedComponent.type !== 'computed-pocket-cluster') {
        throw new Error('Pocket cluster stitch line requires a computed pocket cluster component')
      }
      return calculatePocketClusterStitchLine(stitchLine, component, computedComponent)
    }
  }
}
