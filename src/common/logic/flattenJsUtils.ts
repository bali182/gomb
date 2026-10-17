import Flatten from '@flatten-js/core'
import BigNumber from 'bignumber.js'

import type { PathCommand, PathSchema, PointSchema } from '../schemas/geometry'
import { getClosedPathLoops } from './pathSegments'
import type { PathSegment } from './pathSegmentTypes'

export const subtractClosedPaths = (subject: PathSchema, holes: readonly PathSchema[]): PathSchema => {
  const polygon = holes.reduce<Flatten.Polygon>(
    (result, hole) => Flatten.BooleanOperations.subtract(result, toFlattenPolygon(hole)),
    toFlattenPolygon(subject),
  )

  return fromFlattenPolygon(polygon)
}

export const isClosedPathCoveredBy = (path: PathSchema, coveringPath: PathSchema): boolean => {
  return Flatten.Relations.covered(toFlattenPolygon(path), toFlattenPolygon(coveringPath))
}

export const intersectClosedPaths = (first: PathSchema, second: PathSchema): PathSchema => {
  return fromFlattenPolygon(Flatten.BooleanOperations.intersect(toFlattenPolygon(first), toFlattenPolygon(second)))
}

const toFlattenPolygon = (path: PathSchema): Flatten.Polygon => {
  const polygon = new Flatten.Polygon()

  getClosedPathLoops(path).forEach((loop) => {
    polygon.addFace(loop.map(toFlattenShape))
  })

  return polygon
}

const toFlattenShape = (segment: PathSegment): Flatten.Segment | Flatten.Arc => {
  if (segment.type === 'line') {
    return new Flatten.Segment(toFlattenPoint(segment.start), toFlattenPoint(segment.end))
  }

  return new Flatten.Arc(
    toFlattenPoint(segment.center),
    segment.radius.toNumber(),
    segment.startAngle,
    segment.startAngle + segment.sweepAngle,
    !segment.reversed,
  )
}

const fromFlattenPolygon = (polygon: Flatten.Polygon): PathSchema => {
  return {
    commands: [...polygon.faces].flatMap((face) => getPathCommandsFromFace(face)),
  }
}

const getPathCommandsFromFace = (face: Flatten.Face): PathCommand[] => {
  const firstShape = face.shapes[0]

  if (firstShape === undefined) {
    return []
  }

  const startPoint = fromFlattenPoint(firstShape.start)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: startPoint },
    ...face.shapes.flatMap(getPathCommandsFromShape),
  ]
  const lastCommand = commands[commands.length - 1]

  // Flatten considers endpoints equal within its tolerance, but our path processing uses exact equality.
  // Reuse the start point when the final endpoint is equivalent so closing the contour does not add a tiny line.
  if (
    (lastCommand.type === 'lineTo' || lastCommand.type === 'arcTo') &&
    Flatten.Utils.EQ(lastCommand.point.x.toNumber(), startPoint.x.toNumber()) &&
    Flatten.Utils.EQ(lastCommand.point.y.toNumber(), startPoint.y.toNumber())
  ) {
    commands[commands.length - 1] = { ...lastCommand, point: startPoint }
  }

  commands.push({ type: 'close' })
  return commands
}

const getPathCommandsFromShape = (shape: Flatten.Segment | Flatten.Arc): PathCommand[] => {
  if (shape instanceof Flatten.Segment) {
    return [{ type: 'lineTo', point: fromFlattenPoint(shape.end) }]
  }

  return shape
    .breakToFunctional()
    .filter((arc) => !Flatten.Utils.EQ(arc.start.x, arc.end.x) || !Flatten.Utils.EQ(arc.start.y, arc.end.y))
    .map(getPathCommandFromArc)
}

const getPathCommandFromArc = (arc: Flatten.Arc): PathCommand => {
  return {
    type: 'arcTo',
    radius: new BigNumber(arc.r),
    point: fromFlattenPoint(arc.end),
    reversed: !arc.counterClockwise,
  }
}

const toFlattenPoint = (point: PointSchema): Flatten.Point => {
  return new Flatten.Point(point.x.toNumber(), point.y.toNumber())
}

const fromFlattenPoint = (point: Flatten.Point): PointSchema => {
  return {
    x: new BigNumber(point.x),
    y: new BigNumber(point.y),
  }
}
