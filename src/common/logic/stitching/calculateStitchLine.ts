import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { getComponentStitchLineTypes } from '../../operations/subProject/utils/componentRules'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type {
  ComputedComponentSchema,
  ComputedStitchLineSchema,
  ComputedStitchRouteSchema,
  ComputedTPocketSchema,
} from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
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
  const component = accessors.subProject(subProject).optional.component.byId(stitchLine.targetId)
  const computed = computedComponents[stitchLine.targetId]
  if (!isDefined(component) || !isDefined(computed)) {
    return undefined
  }
  if (!getComponentStitchLineTypes(component).includes(stitchLine.type)) {
    return undefined
  }
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return calculateStandardStitchLine(stitchLine, computed, computedComponents)
    case 't-pocket-stitch-line':
      return calculateComputedTPocketStitchLine(stitchLine, component, computed, subProject)
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

const calculateComputedTPocketStitchLine = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  subProject: SubProjectSchema,
): ComputedStitchLineSchema | undefined => {
  const cluster = narrowers.is.pocketCluster(component)
    ? component
    : accessors.subProject(subProject).optional.component.parent(component.id)
  if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
    return undefined
  }
  if (!narrowers.is.computedPocketCluster(computed) && !narrowers.is.computedTPocket(computed)) {
    return undefined
  }
  const pockets = narrowers.is.computedPocketCluster(computed)
    ? computed.children.filter(narrowers.is.computedTPocket)
    : [computed]
  const routes = pockets.flatMap((pocket) => {
    const route = calculatePocketStitchRoute(stitchLine, cluster, pocket)
    return isDefined(route) ? [route] : []
  })
  const boundingRect = calculateStitchLineBoundingRect(
    routes.flatMap(({ boundingRect }): PointSchema[] => [
      { x: boundingRect.x, y: boundingRect.y },
      { x: boundingRect.x.plus(boundingRect.width), y: boundingRect.y.plus(boundingRect.height) },
    ]),
  )
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
    routes,
  }
}

const calculatePocketStitchRoute = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  cluster: PocketClusterSchema,
  pocket: ComputedTPocketSchema,
): ComputedStitchRouteSchema | undefined => {
  const calculated = calculateTPocketStitchLine(stitchLine, cluster, pocket)
  if (!isDefined(calculated)) {
    return undefined
  }
  const labelPosition: StitchSideSchema =
    cluster.orientation === 'up' ? 'top' : cluster.orientation === 'down' ? 'bottom' : cluster.orientation
  const holes = calculateTPocketStitchHoles(stitchLine, calculated.line)
  return {
    targetType: 'component',
    targetId: pocket.componentId,
    boundingRect: calculateStitchLineBoundingRect([calculated.line.start, calculated.line.end]),
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
}
