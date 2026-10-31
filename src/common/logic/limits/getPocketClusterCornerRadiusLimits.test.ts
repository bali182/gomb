import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { HasCornerRadiusValuesSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { CornerRadiusSchema, RectSchema } from '../../schemas/geometry'
import { d } from '../../testData'
import { getAdjustedCornerRadius } from '../getAdjustedCornerRadius'
import { getPocketClusterCornerRadiusLimits } from './getPocketClusterCornerRadiusLimits'

const openingCorners: Record<PocketOrientationSchema, readonly (keyof CornerRadiusSchema)[]> = {
  up: ['topLeft', 'topRight'],
  down: ['bottomLeft', 'bottomRight'],
  left: ['topLeft', 'bottomLeft'],
  right: ['topRight', 'bottomRight'],
}

const radiusFields: Record<keyof CornerRadiusSchema, keyof HasCornerRadiusValuesSchema> = {
  topLeft: 'topLeftRadius',
  topRight: 'topRightRadius',
  bottomLeft: 'bottomLeftRadius',
  bottomRight: 'bottomRightRadius',
}

const boundingRect: RectSchema = {
  x: new BigNumber(0),
  y: new BigNumber(0),
  width: new BigNumber(100),
  height: new BigNumber(100),
}

describe.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])(
  'getPocketClusterCornerRadiusLimits: %s',
  (orientation) => {
    const pocketCluster = d.pocketCluster({ id: 'cluster', orientation })
    it('ignores opening-side radii and parent minima with an informational zero maximum', () => {
      const radius: CornerRadiusSchema = {
        topLeft: new BigNumber(20),
        topRight: new BigNumber(20),
        bottomLeft: new BigNumber(20),
        bottomRight: new BigNumber(20),
      }
      const limits = getPocketClusterCornerRadiusLimits({
        pocketCluster,
        boundingRect,
        cornerRadius: radius,
        parentBoundingRect: boundingRect,
        parentCornerRadius: radius,
      })
      const adjusted = getAdjustedCornerRadius(radius, limits)
      for (const corner of openingCorners[orientation]) {
        expect(limits[radiusFields[corner]]).toEqual({
          max: { value: new BigNumber(0), reason: 'pocket-opening-corner-radius-ignored', severity: 'info' },
        })
        expect(adjusted[corner].toNumber()).toBe(0)
      }
    })

    it('does not let ignored own or parent radii reduce the closed-side maxima', () => {
      const radius: CornerRadiusSchema = {
        topLeft: new BigNumber(10),
        topRight: new BigNumber(20),
        bottomLeft: new BigNumber(30),
        bottomRight: new BigNumber(40),
      }
      let withoutOpening: CornerRadiusSchema = { ...radius }
      let largeOpening: CornerRadiusSchema = { ...radius }
      let parentRadius: CornerRadiusSchema = ZERO_CORNER_RADIUS
      for (const corner of openingCorners[orientation]) {
        withoutOpening = { ...withoutOpening, [corner]: new BigNumber(0) }
        largeOpening = { ...largeOpening, [corner]: new BigNumber(1000) }
        parentRadius = { ...parentRadius, [corner]: new BigNumber(1000) }
      }
      const snapshot = JSON.stringify({ largeOpening, parentRadius, boundingRect })
      const expected = getPocketClusterCornerRadiusLimits({ pocketCluster, boundingRect, cornerRadius: withoutOpening })
      const actual = getPocketClusterCornerRadiusLimits({
        pocketCluster,
        boundingRect,
        cornerRadius: largeOpening,
        parentBoundingRect: boundingRect,
        parentCornerRadius: parentRadius,
      })
      expect(actual).toEqual(expected)
      expect(JSON.stringify({ largeOpening, parentRadius, boundingRect })).toBe(snapshot)
    })

    it('preserves parent minima and neighbouring-corner limits on the closed side', () => {
      const parentRadius: CornerRadiusSchema = {
        topLeft: new BigNumber(40),
        topRight: new BigNumber(40),
        bottomLeft: new BigNumber(40),
        bottomRight: new BigNumber(40),
      }
      const limits = getPocketClusterCornerRadiusLimits({
        pocketCluster,
        boundingRect,
        cornerRadius: ZERO_CORNER_RADIUS,
        parentBoundingRect: boundingRect,
        parentCornerRadius: parentRadius,
      })
      for (const corner of Object.keys(radiusFields) as (keyof CornerRadiusSchema)[]) {
        if (openingCorners[orientation].includes(corner)) {
          continue
        }
        expect(limits[radiusFields[corner]]).toEqual({
          min: { value: new BigNumber(40), reason: 'parent-corner-radius', severity: 'info' },
          max: { value: new BigNumber(60), reason: 'corner-radii-share-edge', severity: 'warning' },
        })
      }
    })

    it('allows closed-side radii above the inherited minimum without changing the requested values', () => {
      const radius: CornerRadiusSchema = {
        topLeft: new BigNumber(30),
        topRight: new BigNumber(30),
        bottomLeft: new BigNumber(30),
        bottomRight: new BigNumber(30),
      }
      const parentRadius: CornerRadiusSchema = {
        topLeft: new BigNumber(10),
        topRight: new BigNumber(10),
        bottomLeft: new BigNumber(10),
        bottomRight: new BigNumber(10),
      }
      const before = JSON.stringify(radius)
      const limits = getPocketClusterCornerRadiusLimits({
        pocketCluster,
        boundingRect,
        cornerRadius: radius,
        parentBoundingRect: boundingRect,
        parentCornerRadius: parentRadius,
      })
      const adjusted = getAdjustedCornerRadius(radius, limits)
      for (const corner of Object.keys(radiusFields) as (keyof CornerRadiusSchema)[]) {
        if (openingCorners[orientation].includes(corner)) {
          expect(adjusted[corner].isZero()).toBe(true)
        } else {
          expect(limits[radiusFields[corner]]?.min?.value.eq(10)).toBe(true)
          expect(adjusted[corner].eq(30)).toBe(true)
        }
      }
      expect(JSON.stringify(radius)).toBe(before)
    })
  },
)
