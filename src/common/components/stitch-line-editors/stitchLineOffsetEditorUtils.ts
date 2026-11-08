import {
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { HasStitchedCornersSchema, HasStitchedSidesSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import type { NumberInputArrowPosition } from '../common/NumberInputArrow'

export type StitchLineOffsetEndpoint = 'start' | 'end'

export const getStitchLineOffsetPosition = (
  value: HasStitchedSidesSchema & HasStitchedCornersSchema,
  endpoint: StitchLineOffsetEndpoint,
): StitchLineSideOrCornerField | undefined => {
  const position = STITCH_LINE_SIDE_AND_CORNER_ORDER.find((field, index, fields) => {
    const adjacentIndex = endpoint === 'start' ? index + fields.length - 1 : index + 1
    const adjacent = fields[adjacentIndex % fields.length]
    return value[field] && !value[adjacent]
  })
  if (isDefined(position)) {
    return position
  }
  if (endpoint === 'start' && value.top) {
    return 'top'
  }
  if (endpoint === 'end' && value.topLeftCorner) {
    return 'topLeftCorner'
  }
  return undefined
}

export const getStitchLineOffsetArrowPosition = (
  position: StitchLineSideOrCornerField | undefined,
  otherPosition: StitchLineSideOrCornerField | undefined,
  endpoint: StitchLineOffsetEndpoint,
): NumberInputArrowPosition | undefined => {
  if (!isDefined(position)) {
    return undefined
  }
  const sharedCorner =
    position === otherPosition &&
    position !== 'top' &&
    position !== 'right' &&
    position !== 'bottom' &&
    position !== 'left'
  if (sharedCorner) {
    const hasStartArrow = position === 'topLeftCorner' || position === 'bottomRightCorner'
    if ((endpoint === 'start') !== hasStartArrow) {
      return undefined
    }
  }
  return STITCH_LINE_OFFSET_ARROW_POSITIONS[position]
}

const STITCH_LINE_OFFSET_ARROW_POSITIONS: Record<StitchLineSideOrCornerField, NumberInputArrowPosition> = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  topLeftCorner: 'top-left',
  topRightCorner: 'top-right',
  bottomLeftCorner: 'bottom-left',
  bottomRightCorner: 'bottom-right',
}
