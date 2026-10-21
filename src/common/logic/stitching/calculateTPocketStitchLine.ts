import BigNumber from 'bignumber.js'

import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedTPocketSchema } from '../../schemas/computed'
import type { LineSchema, PathSchema, PointSchema } from '../../schemas/geometry'
import type { ResolvedPocketClusterStitchLineSchema } from '../../schemas/stitching'
import { arePointsEqual } from '../../utils/arePointsEqual'
import { isDefined } from '../../utils/isDefined'
import { last } from '../../utils/last'
import { getPathSegmentIntersections } from '../pathSegmentIntersections'
import { createPathFromConnectedSegments, getPathSegments } from '../pathSegments'
import type { LinePathSegment } from '../pathSegmentTypes'

export type CalculatedTPocketStitchLine = {
  line: LineSchema
  path: PathSchema
}

export const calculateTPocketStitchLine = (
  stitchLine: ResolvedPocketClusterStitchLineSchema,
  pocketCluster: PocketClusterSchema,
  tPocket: ComputedTPocketSchema,
): CalculatedTPocketStitchLine | undefined => {
  const candidate = getMarginLine(stitchLine, pocketCluster, tPocket)
  if (arePointsEqual(candidate.start, candidate.end)) {
    return undefined
  }
  const intersections = getStitchLineIntersections(candidate, tPocket.path)
  const start = intersections[0]
  const end = last(intersections)
  if (!isDefined(start) || !isDefined(end) || arePointsEqual(start, end)) {
    return undefined
  }
  const startOffset = new BigNumber(stitchLine.startOffset)
  const endOffset = new BigNumber(stitchLine.endOffset)
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const line: LineSchema = isVertical
    ? { start: { x: start.x.minus(startOffset), y: start.y }, end: { x: end.x.plus(endOffset), y: end.y } }
    : { start: { x: start.x, y: start.y.minus(startOffset) }, end: { x: end.x, y: end.y.plus(endOffset) } }
  return { line, path: createPathFromConnectedSegments([{ type: 'line', ...line }]) }
}

const getMarginLine = (
  stitchLine: ResolvedPocketClusterStitchLineSchema,
  pocketCluster: PocketClusterSchema,
  pocket: ComputedTPocketSchema,
): LineSchema => {
  const rect = pocket.boundingRect
  const right = rect.x.plus(rect.width)
  const bottom = rect.y.plus(rect.height)
  const margin = new BigNumber(stitchLine.stitchMargin)
  switch (pocketCluster.orientation) {
    case 'up':
      return { start: { x: rect.x, y: bottom.minus(margin) }, end: { x: right, y: bottom.minus(margin) } }
    case 'down':
      return { start: { x: rect.x, y: rect.y.plus(margin) }, end: { x: right, y: rect.y.plus(margin) } }
    case 'left':
      return { start: { x: right.minus(margin), y: rect.y }, end: { x: right.minus(margin), y: bottom } }
    case 'right':
      return { start: { x: rect.x.plus(margin), y: rect.y }, end: { x: rect.x.plus(margin), y: bottom } }
  }
}

/** Sort along the candidate line, so duplicate vertex hits cannot change the two outer endpoints. */
const getStitchLineIntersections = (line: LineSchema, path: PathSchema): PointSchema[] => {
  const candidate: LinePathSegment = { type: 'line', ...line }
  return getPathSegments(path)
    .flatMap((segment) => getPathSegmentIntersections(candidate, segment))
    .sort((first, second) => first.firstProgress.comparedTo(second.firstProgress) ?? 0)
    .map((intersection) => intersection.point)
}
