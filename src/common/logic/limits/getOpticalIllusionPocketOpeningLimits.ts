import BigNumber from 'bignumber.js'

import { POSITION_EPSILON, ZERO } from '../../constants/layout'
import type { PocketClusterSchema, PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type {
  NumericBoundSchema,
  OpticalIllusionPocketOpeningLimitsReasonSchema,
  OpticalIllusionPocketOpeningLimitsSchema,
} from '../../schemas/limits'
import type { OpticalIllusionPocketOpeningSchema } from '../../schemas/pocketOpening'
import { clamp } from '../../utils/clamp'

export const getOpticalIllusionPocketOpeningLimits = (
  opening: OpticalIllusionPocketOpeningSchema,
  pocket: PocketSchema,
  cluster: PocketClusterSchema,
  computed: ComputedPocketSchema,
): OpticalIllusionPocketOpeningLimitsSchema => {
  const vertical = cluster.orientation === 'up' || cluster.orientation === 'down'
  const width = vertical ? computed.boundingRect.width : computed.boundingRect.height
  const depth = vertical ? computed.boundingRect.height : computed.boundingRect.width

  const pocketCount = cluster.children.length
  const insetWidth = BigNumber.maximum(width.minus(new BigNumber(POSITION_EPSILON).times(pocketCount)), 0)
  const startInsetMaximum = getSharedLengthMaximum(new BigNumber(opening.endInset), insetWidth)
  const endInsetMaximum = getSharedLengthMaximum(new BigNumber(opening.startInset), insetWidth)
  const adjustedStartInset = clamp(opening.startInset, 0, startInsetMaximum)
  const adjustedEndInset = clamp(opening.endInset, 0, endInsetMaximum)

  const openingHeight = BigNumber.minimum(cluster.pocketStep, depth)
  const pocketIndex = cluster.children.indexOf(pocket.id)
  const slantedWidth =
    pocketCount === 0 ? ZERO : width.minus(adjustedStartInset).minus(adjustedEndInset).dividedBy(pocketCount)
  const leadingStraightLength = adjustedStartInset.plus(slantedWidth.times(Math.max(pocketCount - 1 - pocketIndex, 0)))
  const trailingStraightLength = width.minus(leadingStraightLength).minus(slantedWidth)
  const slantedLength = slantedWidth.pow(2).plus(openingHeight.pow(2)).sqrt()
  const halfAngleTangent = openingHeight.isZero() ? ZERO : openingHeight.dividedBy(slantedLength.plus(slantedWidth))
  const leadingTangentLength = clamp(
    new BigNumber(opening.leadingRadius).times(halfAngleTangent),
    0,
    BigNumber.maximum(leadingStraightLength, 0),
  )
  const trailingTangentLength = clamp(
    new BigNumber(opening.trailingRadius).times(halfAngleTangent),
    0,
    BigNumber.maximum(trailingStraightLength, 0),
  )

  return {
    type: 'optical-illusion',
    startInset: {
      max: {
        value: startInsetMaximum,
        reason: 'optical-illusion-pocket-opening-insets-share-width',
        severity: 'warning',
      },
    },
    endInset: {
      max: {
        value: endInsetMaximum,
        reason: 'optical-illusion-pocket-opening-insets-share-width',
        severity: 'warning',
      },
    },
    leadingRadius: {
      max: getRadiusLimit(
        leadingStraightLength,
        slantedLength,
        trailingTangentLength,
        halfAngleTangent,
        'optical-illusion-pocket-opening-radius-exceeds-leading-length',
      ),
    },
    trailingRadius: {
      max: getRadiusLimit(
        trailingStraightLength,
        slantedLength,
        leadingTangentLength,
        halfAngleTangent,
        'optical-illusion-pocket-opening-radius-exceeds-trailing-length',
      ),
    },
  }
}

const getSharedLengthMaximum = (otherLength: BigNumber, totalLength: BigNumber): BigNumber => {
  const halfLength = totalLength.dividedBy(2)
  return BigNumber.maximum(otherLength.gt(halfLength) ? halfLength : totalLength.minus(otherLength), 0)
}

const getRadiusLimit = (
  straightLength: BigNumber,
  slantedLength: BigNumber,
  oppositeTangentLength: BigNumber,
  halfAngleTangent: BigNumber,
  straightLimitReason: OpticalIllusionPocketOpeningLimitsReasonSchema,
): NumericBoundSchema => {
  if (halfAngleTangent.isZero()) {
    return { value: ZERO, reason: straightLimitReason, severity: 'warning' }
  }

  const straightRadiusMaximum = BigNumber.maximum(straightLength, 0).dividedBy(halfAngleTangent)
  const slantedRadiusMaximum = getSharedLengthMaximum(oppositeTangentLength, slantedLength).dividedBy(halfAngleTangent)
  return {
    value: BigNumber.minimum(straightRadiusMaximum, slantedRadiusMaximum),
    reason: straightRadiusMaximum.lte(slantedRadiusMaximum)
      ? straightLimitReason
      : 'optical-illusion-pocket-opening-radii-share-slanted-length',
    severity: 'warning',
  }
}
