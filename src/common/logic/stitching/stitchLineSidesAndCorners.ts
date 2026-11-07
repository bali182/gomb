import type { HasStitchedCornersSchema, HasStitchedSidesSchema } from '../../schemas/stitching'

export type StitchLineSideOrCornerField = keyof HasStitchedSidesSchema | keyof HasStitchedCornersSchema

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

export const canToggleStitchLineSideOrCorner = (
  stitchLine: HasStitchedSidesSchema & HasStitchedCornersSchema,
  field: StitchLineSideOrCornerField,
): boolean => {
  const updated = { ...stitchLine, [field]: !stitchLine[field] }
  let starts = 0
  for (let index = 0; index < STITCH_LINE_SIDE_AND_CORNER_ORDER.length; index += 1) {
    const current = STITCH_LINE_SIDE_AND_CORNER_ORDER[index]
    const previous = STITCH_LINE_SIDE_AND_CORNER_ORDER[(index + 7) % 8]
    if (updated[current] && !updated[previous]) {
      starts += 1
    }
  }
  return starts <= 1
}

export const normalizeStitchLineSidesAndCorners = <T extends HasStitchedSidesSchema & HasStitchedCornersSchema>(
  stitchLine: T,
): T => {
  if (STITCH_LINE_SIDE_AND_CORNER_ORDER.every((field) => !stitchLine[field])) {
    return stitchLine
  }
  let longestGapStart = 0
  let longestGapLength = 0
  let missingCount = 0
  for (let index = 0; index < STITCH_LINE_SIDE_AND_CORNER_ORDER.length; index += 1) {
    if (stitchLine[STITCH_LINE_SIDE_AND_CORNER_ORDER[index]]) {
      continue
    }
    missingCount += 1
    let length = 0
    while (length < 8 && !stitchLine[STITCH_LINE_SIDE_AND_CORNER_ORDER[(index + length) % 8]]) {
      length += 1
    }
    if (length > longestGapLength) {
      longestGapStart = index
      longestGapLength = length
    }
  }
  if (missingCount === longestGapLength) {
    return stitchLine
  }
  const updated = { ...stitchLine }
  for (let index = 0; index < STITCH_LINE_SIDE_AND_CORNER_ORDER.length; index += 1) {
    const distanceFromGapStart = (index - longestGapStart + 8) % 8
    if (distanceFromGapStart >= longestGapLength) {
      updated[STITCH_LINE_SIDE_AND_CORNER_ORDER[index]] = true
    }
  }
  return updated
}
