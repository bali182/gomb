import type { ComputedComponentSchema } from '../../schemas/computed'

import type { PathSchema, PointSchema, RectSchema } from '../../schemas/geometry'
import { createPathFromConnectedSegments } from '../pathSegments'
import type { LinePathSegment } from '../pathSegmentTypes'
import { doLinePathSegmentsOverlap } from '../pathSegmentUtils'

export const getExportChildMarkerPaths = (
  children: ComputedComponentSchema[],
  parentBoundingRect: RectSchema,
): PathSchema[] => {
  const parentMarkerLines = getBoundingRectMarkerLines(parentBoundingRect)
  const boundingRects = children.flatMap((child) => {
    switch (child.type) {
      case 'computed-root-panel':
      case 'computed-panel':
        return [child.boundingRect]
      case 'computed-pocket-cluster':
        return [child.frontPocket.boundingRect, ...child.tPockets.map((pocket) => pocket.boundingRect)]
    }
  })

  const markerLines = boundingRects.flatMap((boundingRect) => {
    return getBoundingRectMarkerLines(boundingRect).filter(
      (markerLine) => !parentMarkerLines.some((parentLine) => doLinePathSegmentsOverlap(markerLine, parentLine)),
    )
  })

  return removeDuplicates(markerLines).map((markerLine) => createPathFromConnectedSegments([markerLine]))
}

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
