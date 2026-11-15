import { getCornerRadius } from '../../logic/cornerRadiusUtils'
import { getAdjustedCornerRadius } from '../../logic/getAdjustedCornerRadius'
import {
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { CornerRadiusSchema } from '../../schemas/geometry'
import type { CornerRadiusLimitsSchema } from '../../schemas/limits'
import type {
  HasStitchDirectionSchema,
  HasStitchedCornersSchema,
  HasStitchedSidesSchema,
  StitchDirectionSchema,
} from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import type { NumberInputArrowPosition } from '../common/NumberInputArrow'

export type StitchLineOffsetEndpoint = 'start' | 'end'

export const getStitchLineOffsetCanonicalEndpoint = (
  stitchDirection: StitchDirectionSchema,
  endpoint: StitchLineOffsetEndpoint,
): StitchLineOffsetEndpoint => {
  if (stitchDirection === 'start-to-end') {
    return endpoint
  }
  return endpoint === 'start' ? 'end' : 'start'
}

export const getStitchLineOffsetCornerRadius = (
  autoCornerRadius: boolean,
  value: HasCornerRadiusSchema,
  autoComputedCornerRadius: CornerRadiusSchema | undefined,
  limits: CornerRadiusLimitsSchema | undefined,
): CornerRadiusSchema | undefined => {
  if (autoCornerRadius) {
    return autoComputedCornerRadius
  }
  return getAdjustedCornerRadius(getCornerRadius(value), limits ?? {})
}

export const getStitchLineOffsetPosition = (
  value: HasStitchedSidesSchema & HasStitchedCornersSchema & HasStitchDirectionSchema,
  endpoint: StitchLineOffsetEndpoint,
): StitchLineSideOrCornerField | undefined => {
  const canonicalEndpoint = getStitchLineOffsetCanonicalEndpoint(value.stitchDirection, endpoint)
  const position = STITCH_LINE_SIDE_AND_CORNER_ORDER.find((field, index, fields) => {
    const adjacentIndex = canonicalEndpoint === 'start' ? index + fields.length - 1 : index + 1
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
