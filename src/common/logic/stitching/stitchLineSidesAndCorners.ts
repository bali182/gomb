import type { HasStitchedCornersSchema, HasStitchedSidesSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'

export type StitchLineSideOrCornerField = keyof HasStitchedSidesSchema | keyof HasStitchedCornersSchema

type StitchLineNeighbors = {
  directNeighbors: [StitchLineSideOrCornerField, StitchLineSideOrCornerField]
  sameKindNeighbors: [StitchLineSideOrCornerField, StitchLineSideOrCornerField]
}

type StitchLineGapsByStart = Partial<Record<StitchLineSideOrCornerField, StitchLineSideOrCornerField[]>>

export const STITCH_LINE_SIDE_AND_CORNER_ORDER: readonly StitchLineSideOrCornerField[] = [
  'top',
  'topRightCorner',
  'right',
  'bottomRightCorner',
  'bottom',
  'bottomLeftCorner',
  'left',
  'topLeftCorner',
]

export const STITCH_LINE_DIRECTION_SIDES: readonly (keyof HasStitchedSidesSchema)[] = ['top', 'right', 'bottom', 'left']
export const STITCH_LINE_DIRECTION_CORNERS: readonly (keyof HasStitchedCornersSchema)[] = [
  'topRightCorner',
  'bottomRightCorner',
  'bottomLeftCorner',
  'topLeftCorner',
]

const STITCH_LINE_NEIGHBORS: Record<StitchLineSideOrCornerField, StitchLineNeighbors> = {
  top: {
    directNeighbors: ['topLeftCorner', 'topRightCorner'],
    sameKindNeighbors: ['left', 'right'],
  },
  topRightCorner: {
    directNeighbors: ['top', 'right'],
    sameKindNeighbors: ['topLeftCorner', 'bottomRightCorner'],
  },
  right: {
    directNeighbors: ['topRightCorner', 'bottomRightCorner'],
    sameKindNeighbors: ['top', 'bottom'],
  },
  bottomRightCorner: {
    directNeighbors: ['right', 'bottom'],
    sameKindNeighbors: ['topRightCorner', 'bottomLeftCorner'],
  },
  bottom: {
    directNeighbors: ['bottomRightCorner', 'bottomLeftCorner'],
    sameKindNeighbors: ['right', 'left'],
  },
  bottomLeftCorner: {
    directNeighbors: ['bottom', 'left'],
    sameKindNeighbors: ['bottomRightCorner', 'topLeftCorner'],
  },
  left: {
    directNeighbors: ['bottomLeftCorner', 'topLeftCorner'],
    sameKindNeighbors: ['bottom', 'top'],
  },
  topLeftCorner: {
    directNeighbors: ['left', 'top'],
    sameKindNeighbors: ['bottomLeftCorner', 'topRightCorner'],
  },
}

export const canToggleStitchLineSideOrCorner = (
  stitchLine: HasStitchedSidesSchema & HasStitchedCornersSchema,
  field: StitchLineSideOrCornerField,
): boolean => {
  const sidesAndCorners = STITCH_LINE_SIDE_AND_CORNER_ORDER.filter((field) => stitchLine[field])
  if (sidesAndCorners.length === 0 || sidesAndCorners.length === STITCH_LINE_SIDE_AND_CORNER_ORDER.length) {
    return true
  }

  const [previous, next] = STITCH_LINE_NEIGHBORS[field].directNeighbors
  const [previousSameKind, nextSameKind] = STITCH_LINE_NEIGHBORS[field].sameKindNeighbors
  if (stitchLine[field]) {
    return !stitchLine[previous] || !stitchLine[next] || !stitchLine[previousSameKind] || !stitchLine[nextSameKind]
  }

  return stitchLine[previous] || stitchLine[next] || stitchLine[previousSameKind] || stitchLine[nextSameKind]
}

export const toggleStitchLineSideOrCorner = <T extends HasStitchedSidesSchema & HasStitchedCornersSchema>(
  stitchLine: T,
  field: StitchLineSideOrCornerField,
): T => {
  if (!canToggleStitchLineSideOrCorner(stitchLine, field)) {
    return stitchLine
  }

  const updated = { ...stitchLine, [field]: !stitchLine[field] }
  const [previous, next] = STITCH_LINE_NEIGHBORS[field].directNeighbors
  if (stitchLine[field]) {
    if (stitchLine[previous] && stitchLine[next]) {
      const [previousSameKind, nextSameKind] = STITCH_LINE_NEIGHBORS[field].sameKindNeighbors
      if (!stitchLine[previousSameKind]) {
        updated[previous] = false
      }
      if (!stitchLine[nextSameKind]) {
        updated[next] = false
      }
    }
    return updated
  }

  const missingFields = STITCH_LINE_SIDE_AND_CORNER_ORDER.filter((candidate) => !stitchLine[candidate])
  if (missingFields.length === 3 && !stitchLine[previous] && !stitchLine[next]) {
    updated[previous] = true
    updated[next] = true
  }
  return normalizeStitchLineSidesAndCorners(updated)
}

export const normalizeStitchLineSidesAndCorners = <T extends HasStitchedSidesSchema & HasStitchedCornersSchema>(
  stitchLine: T,
): T => {
  const stitchedFields = STITCH_LINE_SIDE_AND_CORNER_ORDER.filter((field) => stitchLine[field])
  if (stitchedFields.length === 0 || stitchedFields.length === STITCH_LINE_SIDE_AND_CORNER_ORDER.length) {
    return stitchLine
  }

  const gapsByStart: StitchLineGapsByStart = {}
  const firstStitchedField = stitchedFields[0]
  let currentGap: StitchLineSideOrCornerField[] | undefined
  for (
    let field = STITCH_LINE_NEIGHBORS[firstStitchedField].directNeighbors[1];
    field !== firstStitchedField;
    field = STITCH_LINE_NEIGHBORS[field].directNeighbors[1]
  ) {
    if (stitchLine[field]) {
      currentGap = undefined
      continue
    }
    if (!isDefined(currentGap)) {
      currentGap = []
      gapsByStart[field] = currentGap
    }
    currentGap.push(field)
  }

  const gaps = STITCH_LINE_SIDE_AND_CORNER_ORDER.reduce<StitchLineSideOrCornerField[][]>((gaps, field) => {
    const gap = gapsByStart[field]
    if (isDefined(gap)) {
      gaps.push(gap)
    }
    return gaps
  }, [])
  if (gaps.length <= 1) {
    return stitchLine
  }

  const longestGap = gaps.reduce((longest, gap) => (gap.length > longest.length ? gap : longest))
  const normalized = { ...stitchLine }
  for (const gap of gaps) {
    if (gap === longestGap) {
      continue
    }
    for (const field of gap) {
      normalized[field] = true
    }
  }
  return normalized
}
