import type { ComputedComponentAccessorSchema } from '../../schemas/accessors'
import type { ComputedComponentSchema } from '../../schemas/computed'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { narrowers } from '../../utils/narrowers'

import type { PathSchema, PointSchema, RectSchema } from '../../schemas/geometry'
import { reflectRectHorizontally } from '../geometryUtils'
import { createPathFromConnectedSegments } from '../pathSegments'
import type { LinePathSegment } from '../pathSegmentTypes'
import { doLinePathSegmentsOverlap } from '../pathSegmentUtils'

export const getExportChildMarkerPaths = (
  component: ComputedComponentSchema,
  computedSubProject: ComputedSubProjectSchema,
): PathSchema[] => {
  const accessor = accessors.computedSubProject(computedSubProject)
  const parentMarkerLines = getBoundingRectMarkerLines(component.boundingRect)
  const boundingRects = getChildBoundingRects(component, accessor.component)

  const markerLines = boundingRects.flatMap((boundingRect) => {
    return getBoundingRectMarkerLines(boundingRect).filter(
      (markerLine) => !parentMarkerLines.some((parentLine) => doLinePathSegmentsOverlap(markerLine, parentLine)),
    )
  })

  return removeDuplicates(markerLines).map((markerLine) => createPathFromConnectedSegments([markerLine]))
}

const getChildBoundingRects = (
  component: ComputedComponentSchema,
  accessor: ComputedComponentAccessorSchema,
): RectSchema[] => {
  if (narrowers.is.computedRootPanel(component)) {
    const axisX = component.boundingRect.x.plus(component.boundingRect.width.dividedBy(2))
    return [
      ...collectChildBoundingRects(component.frontFaceId, accessor),
      ...collectChildBoundingRects(component.backFaceId, accessor).map((rect) => reflectRectHorizontally(rect, axisX)),
    ]
  }

  return collectChildBoundingRects(component.componentId, accessor)
}

const collectChildBoundingRects = (componentId: string, accessor: ComputedComponentAccessorSchema): RectSchema[] =>
  accessor.children(componentId).flatMap((child) => {
    if (narrowers.is.computedGuide(child)) {
      return collectChildBoundingRects(child.componentId, accessor)
    }
    return narrowers.is.computedPocketCluster(child)
      ? accessor.children(child.componentId).map((pocket) => pocket.boundingRect)
      : [child.boundingRect]
  })

const getBoundingRectMarkerLines = (boundingRect: RectSchema): LinePathSegment[] => {
  const right = boundingRect.x.plus(boundingRect.width)
  const bottom = boundingRect.y.plus(boundingRect.height)
  const topLeft: PointSchema = { x: boundingRect.x, y: boundingRect.y }
  const topRight: PointSchema = { x: right, y: boundingRect.y }
  const bottomRight: PointSchema = { x: right, y: bottom }
  const bottomLeft: PointSchema = { x: boundingRect.x, y: bottom }

  return [
    { type: 'line', start: topLeft, end: topRight },
    { type: 'line', start: topRight, end: bottomRight },
    { type: 'line', start: bottomRight, end: bottomLeft },
    { type: 'line', start: bottomLeft, end: topLeft },
  ]
}

const removeDuplicates = (lines: LinePathSegment[]): LinePathSegment[] => {
  const uniqueLinesByKey = new Map<string, LinePathSegment>()

  for (const line of lines) {
    const start = `${line.start.x.toString()},${line.start.y.toString()}`
    const end = `${line.end.x.toString()},${line.end.y.toString()}`
    const key = [start, end].sort().join(':')

    if (!uniqueLinesByKey.has(key)) {
      uniqueLinesByKey.set(key, line)
    }
  }

  return [...uniqueLinesByKey.values()]
}
