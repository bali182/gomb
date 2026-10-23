import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { getComponentStitchLineType } from '../../operations/subProject/utils/componentRules'
import { getComponentParent } from '../../operations/subProject/utils/getComponentParent'
import type { ComponentSchema } from '../../schemas/components'
import type {
  ComputedComponentSchema,
  ComputedStitchLineSchema,
  ComputedStitchRouteSchema,
} from '../../schemas/computed'
import type {
  ResolvedComponentBoundsStitchLineSchema,
  ResolvedStitchLineSchema,
  ResolvedTPocketStitchLineSchema,
  StitchSideSchema,
} from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculateRouteStitches } from './calculateRouteStitches'
import { calculateStitchLineBoundingRect } from './calculateStitchLineBoundingRect'
import { calculateTPocketStitchHoles } from './calculateTPocketStitchHoles'
import { calculateTPocketStitchLine } from './calculateTPocketStitchLine'

export const calculateStitchLine = (
  stitchLine: ResolvedStitchLineSchema,
  subProject: SubProjectSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
): ComputedStitchLineSchema | undefined => {
  const component = accessors.subProject(subProject).optional.component(stitchLine.targetId)
  const computed = computedComponents[stitchLine.targetId]
  if (!isDefined(component) || !isDefined(computed)) {
    return undefined
  }
  if (getComponentStitchLineType(component) !== stitchLine.type) {
    return undefined
  }
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return calculateStandardStitchLine(stitchLine, computed, computedComponents)
    case 't-pocket-stitch-line':
      return calculatePocketBottomStitchLine(stitchLine, component, computed, subProject)
  }
}

const calculateStandardStitchLine = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  computed: ComputedComponentSchema,
  components: Record<string, ComputedComponentSchema>,
): ComputedStitchLineSchema => {
  return calculateComponentBoundsStitchLine(
    stitchLine,
    { componentId: computed.componentId, boundingRect: computed.boundingRect, cornerRadius: computed.cornerRadius },
    components,
  )
}

const calculatePocketBottomStitchLine = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  subProject: SubProjectSchema,
): ComputedStitchLineSchema | undefined => {
  if (computed.type !== 'computed-t-pocket') {
    return undefined
  }
  const cluster = getComponentParent(component.id, subProject)
  if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
    return undefined
  }
  const calculated = calculateTPocketStitchLine(stitchLine, cluster, computed)
  const labelPosition: StitchSideSchema =
    cluster.orientation === 'up' ? 'top' : cluster.orientation === 'down' ? 'bottom' : cluster.orientation
  const holes = isDefined(calculated) ? calculateTPocketStitchHoles(stitchLine, calculated.line) : []
  const boundingRect = calculateStitchLineBoundingRect(
    isDefined(calculated) ? [calculated.line.start, calculated.line.end] : [],
  )
  const route: ComputedStitchRouteSchema | undefined = isDefined(calculated)
    ? {
        boundingRect,
        path: calculated.path,
        holes,
        isClosed: false,
        stitches: calculateRouteStitches(holes, false),
        labelPosition,
        disconnectedCorners: {
          'top-left': undefined,
          'top-right': undefined,
          'bottom-right': undefined,
          'bottom-left': undefined,
        },
      }
    : undefined

  return {
    stitchLineId: stitchLine.id,
    type: stitchLine.type,
    targetType: stitchLine.targetType,
    targetId: stitchLine.targetId,
    componentId: component.id,
    onTop: component.id,
    autoComputedCornerRadius: ZERO_CORNER_RADIUS,
    boundingRect,
    connectingStitches: [],
    routes: isDefined(route) ? [route] : [],
  }
}
