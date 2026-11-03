import type {
  AnchorSchema,
  FlipAxisSchema,
  HasCornerRadiusValuesSchema,
  HasStretchValuesSchema,
} from '../../schemas/common'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketOrientationSchema,
  RootPanelSchema,
} from '../../schemas/components'
import type { HoleSchema } from '../../schemas/hole'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { updateHole } from './updateHole'
import { getComponentDescendants } from './utils/getComponentDescendants'

export const flip = (
  subProject: SubProjectSchema,
  model: ModelObjectSchema,
  axis: FlipAxisSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  switch (model.type) {
    case 'straight':
    case 'slanted':
    case 'recessed':
    case 'optical-illusion':
      return subProject
    case 'root-panel':
      return flipComponentSubtree(subProject, narrowers.assert.rootPanel(accessor.component.byId(model.id)), axis)
    case 'panel':
      return flipComponentSubtree(subProject, accessor.component.panel(model.id), axis)
    case 'pocket-cluster':
      return flipComponentSubtree(subProject, accessor.component.pocketCluster(model.id), axis)
    case 'front-pocket':
      return flipComponentSubtree(subProject, accessor.component.frontPocket(model.id), axis)
    case 't-pocket':
      return flipComponentSubtree(subProject, accessor.component.tPocket(model.id), axis)
    case 'hole': {
      const hole = accessor.hole.byId(model.id)
      const updated = updateHole(subProject, { hole: flipHole(hole, axis) })
      return {
        ...updated,
        stitchLines: subProject.stitchLines.map((stitchLine) =>
          stitchLine.targetType === 'hole' && stitchLine.targetId === hole.id
            ? flipStitchLine(stitchLine, subProject, axis)
            : stitchLine,
        ),
      }
    }
    case 'component-bounds-stitch-line': {
      const stitchLine = accessor.stitchLine.bounds(model.id)
      return {
        ...subProject,
        stitchLines: subProject.stitchLines.map((candidate) =>
          candidate === stitchLine ? flipStitchLine(candidate, subProject, axis) : candidate,
        ),
      }
    }
    case 't-pocket-stitch-line': {
      const stitchLine = accessor.stitchLine.tPocket(model.id)
      const flipped = flipStitchLine(stitchLine, subProject, axis)
      if (flipped === stitchLine) {
        return subProject
      }
      return {
        ...subProject,
        stitchLines: subProject.stitchLines.map((candidate) => (candidate === stitchLine ? flipped : candidate)),
      }
    }
  }
}

/** Uses the flattened descendants once, then flips owned holes and their referenced stitch lines. */
const flipComponentSubtree = (
  subProject: SubProjectSchema,
  component: ComponentSchema,
  axis: FlipAxisSchema,
): SubProjectSchema => {
  const componentIds = new Set(getComponentDescendants(component, subProject))
  const components = { ...subProject.components }
  for (const componentId of componentIds) {
    components[componentId] = flipComponent(
      accessors.subProject(subProject).component.byId(componentId),
      subProject,
      axis,
      componentIds,
    )
  }
  const holeIds = new Set(subProject.holes.filter((hole) => componentIds.has(hole.componentId)).map((hole) => hole.id))
  const holes = subProject.holes.map((hole) => (holeIds.has(hole.id) ? flipHole(hole, axis) : hole))
  const stitchLines = subProject.stitchLines.map((stitchLine) => {
    const isIncluded =
      stitchLine.targetType === 'component' ? componentIds.has(stitchLine.targetId) : holeIds.has(stitchLine.targetId)
    return isIncluded ? flipStitchLine(stitchLine, subProject, axis) : stitchLine
  })
  return { ...subProject, components, holes, stitchLines }
}

const flipComponent = (
  component: ComponentSchema,
  subProject: SubProjectSchema,
  axis: FlipAxisSchema,
  flippedComponentIds: ReadonlySet<string>,
): ComponentSchema => {
  const accessor = accessors.subProject(subProject)
  switch (component.type) {
    case 'root-panel': {
      const flipped: RootPanelSchema = {
        ...component,
        ...flipCornerRadii(component, axis),
        children: flipChildOrder(component, axis),
        mainAxisAnchor:
          component.layoutOrientation === axis ? flipAnchor(component.mainAxisAnchor) : component.mainAxisAnchor,
      }
      return flipped
    }
    case 'panel': {
      const flipped: PanelSchema = {
        ...component,
        ...flipCornerRadii(component, axis),
        ...flipStretch(component, axis),
        children: flipChildOrder(component, axis),
        mainAxisAnchor:
          component.layoutOrientation === axis ? flipAnchor(component.mainAxisAnchor) : component.mainAxisAnchor,
        offAxisAnchor: flipOffAxisAnchor(component, subProject, axis, flippedComponentIds),
      }
      return flipped
    }
    case 'pocket-cluster': {
      const flipped: PocketClusterSchema = {
        ...component,
        ...flipCornerRadii(component, axis),
        ...flipStretch(component, axis),
        orientation: flipOrientation(component.orientation, axis),
        offAxisAnchor: flipOffAxisAnchor(component, subProject, axis, flippedComponentIds),
      }
      return flipped
    }
    case 'front-pocket': {
      const cluster = narrowers.assert.pocketCluster(accessor.component.parent(component.id))
      const flipped: FrontPocketSchema = {
        ...component,
        ...flipCornerRadii(component, axis),
        children: flipChildOrder(component, axis),
        mainAxisAnchor:
          component.layoutOrientation === axis ? flipAnchor(component.mainAxisAnchor) : component.mainAxisAnchor,
        itemCrossAxisOffset: isCrossAxisFlip(cluster.orientation, axis)
          ? 0 - component.itemCrossAxisOffset
          : component.itemCrossAxisOffset,
      }
      return flipped
    }
    case 't-pocket': {
      const cluster = narrowers.assert.pocketCluster(accessor.component.parent(component.id))
      const itemCrossAxisOffset = isCrossAxisFlip(cluster.orientation, axis)
        ? 0 - component.itemCrossAxisOffset
        : component.itemCrossAxisOffset
      return itemCrossAxisOffset === component.itemCrossAxisOffset ? component : { ...component, itemCrossAxisOffset }
    }
  }
}

const flipHole = (hole: HoleSchema, axis: FlipAxisSchema): HoleSchema => {
  switch (axis) {
    case 'horizontal':
      return {
        ...hole,
        ...flipCornerRadii(hole, axis),
        xAnchor: flipAnchor(hole.xAnchor),
        xOffset: hole.xAnchor === 'middle' ? -hole.xOffset : hole.xOffset,
      }
    case 'vertical':
      return {
        ...hole,
        ...flipCornerRadii(hole, axis),
        yAnchor: flipAnchor(hole.yAnchor),
        yOffset: hole.yAnchor === 'middle' ? -hole.yOffset : hole.yOffset,
      }
  }
}

const flipStitchLine = (
  stitchLine: StitchLineSchema,
  subProject: SubProjectSchema,
  axis: FlipAxisSchema,
): StitchLineSchema => {
  switch (stitchLine.type) {
    case 't-pocket-stitch-line': {
      const accessor = accessors.subProject(subProject)
      const target = accessor.component.byId(stitchLine.targetId)
      const cluster = narrowers.is.pocketCluster(target)
        ? target
        : narrowers.assert.pocketCluster(accessor.component.parent(target.id))
      if (!isCrossAxisFlip(cluster.orientation, axis)) {
        return stitchLine
      }
      return {
        ...stitchLine,
        startOffset: stitchLine.endOffset,
        endOffset: stitchLine.startOffset,
        stitchDirection: stitchLine.stitchDirection === 'start-to-end' ? 'end-to-start' : 'start-to-end',
      }
    }
    case 'component-bounds-stitch-line':
      switch (axis) {
        case 'horizontal':
          return {
            ...stitchLine,
            ...flipCornerRadii(stitchLine, axis),
            bottomEndOffset: stitchLine.bottomStartOffset,
            bottomLeftCorner: stitchLine.bottomRightCorner,
            bottomRightCorner: stitchLine.bottomLeftCorner,
            bottomStartOffset: stitchLine.bottomEndOffset,
            bottomStitchDirection:
              stitchLine.bottomStitchDirection === 'left-to-right' ? 'right-to-left' : 'left-to-right',
            left: stitchLine.right,
            leftEndOffset: stitchLine.rightStartOffset,
            leftStartOffset: stitchLine.rightEndOffset,
            leftStitchDirection: stitchLine.rightStitchDirection,
            right: stitchLine.left,
            rightEndOffset: stitchLine.leftStartOffset,
            rightStartOffset: stitchLine.leftEndOffset,
            rightStitchDirection: stitchLine.leftStitchDirection,
            topEndOffset: stitchLine.topStartOffset,
            topLeftCorner: stitchLine.topRightCorner,
            topRightCorner: stitchLine.topLeftCorner,
            topStartOffset: stitchLine.topEndOffset,
            topStitchDirection: stitchLine.topStitchDirection === 'left-to-right' ? 'right-to-left' : 'left-to-right',
            stitchDisconnectedTopLeftCorner: stitchLine.stitchDisconnectedTopRightCorner,
            stitchDisconnectedTopRightCorner: stitchLine.stitchDisconnectedTopLeftCorner,
            stitchDisconnectedBottomLeftCorner: stitchLine.stitchDisconnectedBottomRightCorner,
            stitchDisconnectedBottomRightCorner: stitchLine.stitchDisconnectedBottomLeftCorner,
          }
        case 'vertical':
          return {
            ...stitchLine,
            ...flipCornerRadii(stitchLine, axis),
            bottom: stitchLine.top,
            bottomEndOffset: stitchLine.topStartOffset,
            bottomLeftCorner: stitchLine.topLeftCorner,
            bottomRightCorner: stitchLine.topRightCorner,
            bottomStartOffset: stitchLine.topEndOffset,
            bottomStitchDirection: stitchLine.topStitchDirection,
            leftEndOffset: stitchLine.leftStartOffset,
            leftStartOffset: stitchLine.leftEndOffset,
            leftStitchDirection: stitchLine.leftStitchDirection === 'top-to-bottom' ? 'bottom-to-top' : 'top-to-bottom',
            rightEndOffset: stitchLine.rightStartOffset,
            rightStartOffset: stitchLine.rightEndOffset,
            rightStitchDirection:
              stitchLine.rightStitchDirection === 'top-to-bottom' ? 'bottom-to-top' : 'top-to-bottom',
            top: stitchLine.bottom,
            topEndOffset: stitchLine.bottomStartOffset,
            topLeftCorner: stitchLine.bottomLeftCorner,
            topRightCorner: stitchLine.bottomRightCorner,
            topStartOffset: stitchLine.bottomEndOffset,
            topStitchDirection: stitchLine.bottomStitchDirection,
            stitchDisconnectedTopLeftCorner: stitchLine.stitchDisconnectedBottomLeftCorner,
            stitchDisconnectedTopRightCorner: stitchLine.stitchDisconnectedBottomRightCorner,
            stitchDisconnectedBottomLeftCorner: stitchLine.stitchDisconnectedTopLeftCorner,
            stitchDisconnectedBottomRightCorner: stitchLine.stitchDisconnectedTopRightCorner,
          }
      }
  }
}

const flipCornerRadii = (value: HasCornerRadiusValuesSchema, axis: FlipAxisSchema): HasCornerRadiusValuesSchema => {
  switch (axis) {
    case 'horizontal':
      return {
        topLeftRadius: value.topRightRadius,
        topRightRadius: value.topLeftRadius,
        bottomLeftRadius: value.bottomRightRadius,
        bottomRightRadius: value.bottomLeftRadius,
      }
    case 'vertical':
      return {
        topLeftRadius: value.bottomLeftRadius,
        topRightRadius: value.bottomRightRadius,
        bottomLeftRadius: value.topLeftRadius,
        bottomRightRadius: value.topRightRadius,
      }
  }
}

const flipStretch = (value: HasStretchValuesSchema, axis: FlipAxisSchema): HasStretchValuesSchema => {
  switch (axis) {
    case 'horizontal':
      return {
        topStretch: value.topStretch,
        bottomStretch: value.bottomStretch,
        leftStretch: value.rightStretch,
        rightStretch: value.leftStretch,
      }
    case 'vertical':
      return {
        topStretch: value.bottomStretch,
        bottomStretch: value.topStretch,
        leftStretch: value.leftStretch,
        rightStretch: value.rightStretch,
      }
  }
}

const flipChildOrder = (
  component: RootPanelSchema | PanelSchema | FrontPocketSchema,
  axis: FlipAxisSchema,
): string[] => {
  return component.layoutOrientation === axis ? [...component.children].reverse() : component.children
}

const flipOffAxisAnchor = (
  component: PanelSchema | PocketClusterSchema,
  subProject: SubProjectSchema,
  axis: FlipAxisSchema,
  flippedComponentIds: ReadonlySet<string>,
): AnchorSchema => {
  const parent = accessors.subProject(subProject).optional.component.parent(component.id)
  if (!isDefined(parent) || !flippedComponentIds.has(parent.id)) {
    return component.offAxisAnchor
  }
  switch (parent.type) {
    case 'root-panel':
    case 'panel':
    case 'front-pocket':
      return parent.layoutOrientation !== axis ? flipAnchor(component.offAxisAnchor) : component.offAxisAnchor
    case 'pocket-cluster':
    case 't-pocket':
      return component.offAxisAnchor
  }
}

const flipAnchor = (anchor: AnchorSchema): AnchorSchema => {
  switch (anchor) {
    case 'start':
      return 'end'
    case 'middle':
      return 'middle'
    case 'end':
      return 'start'
  }
}

const flipOrientation = (orientation: PocketOrientationSchema, axis: FlipAxisSchema): PocketOrientationSchema => {
  switch (axis) {
    case 'horizontal':
      if (orientation === 'left') {
        return 'right'
      }
      return orientation === 'right' ? 'left' : orientation
    case 'vertical':
      if (orientation === 'up') {
        return 'down'
      }
      return orientation === 'down' ? 'up' : orientation
  }
}

const isCrossAxisFlip = (orientation: PocketOrientationSchema, axis: FlipAxisSchema): boolean => {
  const hasHorizontalOpening = orientation === 'up' || orientation === 'down'
  return hasHorizontalOpening ? axis === 'horizontal' : axis === 'vertical'
}
