import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { getComponentStitchLineTypes } from '../../operations/subProject/utils/componentRules'
import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { ComponentSchema, PocketClusterSchema, PocketOrientationSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import type {
  ResolvedComponentBoundsStitchLineSchema,
  ResolvedStitchLineSchema,
  ResolvedTPocketStitchLineSchema,
  StitchSideSchema,
} from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { calculateRouteStitches } from './calculateRouteStitches'
import { calculateStitchLineBoundingRect } from './calculateStitchLineBoundingRect'
import { calculateTPocketStitchHoles } from './calculateTPocketStitchHoles'
import { calculateTPocketStitchLine } from './calculateTPocketStitchLine'
import type { StitchLineGeometry, StitchRouteGeometry } from './helperTypes'

export const calculateStitchLine = (
  stitchLine: ResolvedStitchLineSchema,
  accessor: SubProjectAccessorSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
): StitchLineGeometry | undefined => {
  const component = accessor.optional.component.byId(stitchLine.targetId)
  const computed = computedComponents[stitchLine.targetId]
  if (!isDefined(component) || !isDefined(computed)) {
    return undefined
  }
  if (!getComponentStitchLineTypes(component).includes(stitchLine.type)) {
    return undefined
  }
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return calculateStandardStitchLine(stitchLine, computed)
    case 't-pocket-stitch-line':
      return calculateComputedTPocketStitchLine(stitchLine, component, computed, computedComponents, accessor)
  }
}

const calculateStandardStitchLine = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  computed: ComputedComponentSchema,
): StitchLineGeometry => {
  return calculateComponentBoundsStitchLine(stitchLine, {
    componentId: computed.componentId,
    boundingRect: computed.boundingRect,
    cornerRadius: computed.cornerRadius,
  })
}

const calculateComputedTPocketStitchLine = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  computedComponents: Record<string, ComputedComponentSchema>,
  accessor: SubProjectAccessorSchema,
): StitchLineGeometry | undefined => {
  const cluster = narrowers.is.pocketCluster(component) ? component : accessor.optional.component.parent(component.id)
  if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
    return undefined
  }
  if (!narrowers.is.computedPocketCluster(computed) && !narrowers.is.computedTPocket(computed)) {
    return undefined
  }
  const pockets = narrowers.is.computedPocketCluster(computed)
    ? computed.children.map((pocketId) => computedComponents[pocketId]).filter(narrowers.is.computedTPocket)
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
    autoComputedCornerRadius: ZERO_CORNER_RADIUS,
    boundingRect,
    routes,
  }
}

const calculatePocketStitchRoute = (
  stitchLine: ResolvedTPocketStitchLineSchema,
  cluster: PocketClusterSchema,
  pocket: ComputedTPocketSchema,
): StitchRouteGeometry | undefined => {
  const calculated = calculateTPocketStitchLine(stitchLine, cluster, pocket)
  if (!isDefined(calculated)) {
    return undefined
  }
  const labelPosition = getPocketStitchLabelPosition(cluster.orientation)
  const holes = calculateTPocketStitchHoles(stitchLine, calculated.line)
  const side = getPocketStitchSide(cluster.orientation)
  return {
    targetType: 'component',
    targetId: pocket.componentId,
    boundingRect: calculateStitchLineBoundingRect([calculated.line.start, calculated.line.end]),
    path: calculated.path,
    fragments: [{ type: 'side', side, start: calculated.line.start, end: calculated.line.end }],
    holes,
    isClosed: false,
    stitches: calculateRouteStitches(holes, false),
    labelPosition,
  }
}

const getPocketStitchSide = (orientation: PocketOrientationSchema): StitchSideSchema => {
  switch (orientation) {
    case 'up':
      return 'bottom'
    case 'down':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

const getPocketStitchLabelPosition = (orientation: PocketOrientationSchema): StitchSideSchema => {
  switch (orientation) {
    case 'up':
      return 'top'
    case 'down':
      return 'bottom'
    case 'left':
      return 'left'
    case 'right':
      return 'right'
  }
}
