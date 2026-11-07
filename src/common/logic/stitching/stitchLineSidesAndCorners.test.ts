import { describe, expect, it } from 'vitest'
import type { HasStitchedCornersSchema, HasStitchedSidesSchema } from '../../schemas/stitching'
import {
  canToggleStitchLineSideOrCorner,
  normalizeStitchLineSidesAndCorners,
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
} from './stitchLineSidesAndCorners'

const sidesAndCorners = (mask: number): HasStitchedSidesSchema & HasStitchedCornersSchema => ({
  top: (mask & 1) !== 0,
  topRightCorner: (mask & 2) !== 0,
  right: (mask & 4) !== 0,
  bottomRightCorner: (mask & 8) !== 0,
  bottom: (mask & 16) !== 0,
  bottomLeftCorner: (mask & 32) !== 0,
  left: (mask & 64) !== 0,
  topLeftCorner: (mask & 128) !== 0,
})

// Independently enumerate every possible contiguous interval on the circular boundary.
const validMasks = new Set([0, 255])
for (let start = 0; start < 8; start += 1) {
  let mask = 0
  for (let length = 1; length < 8; length += 1) {
    mask |= 1 << ((start + length - 1) % 8)
    validMasks.add(mask)
  }
}
const countBits = (mask: number): number => mask.toString(2).replace(/0/g, '').length
const toMask = (value: HasStitchedSidesSchema & HasStitchedCornersSchema): number => {
  return STITCH_LINE_SIDE_AND_CORNER_ORDER.reduce((mask, field, index) => mask | (value[field] ? 1 << index : 0), 0)
}

describe('stitched sides and corners', () => {
  it('minimally repairs every boundary configuration using only additions', () => {
    for (let mask = 0; mask < 256; mask += 1) {
      const input = sidesAndCorners(mask)
      const before = { ...input }
      const normalized = normalizeStitchLineSidesAndCorners(input)
      const actual = toMask(normalized)
      const minimum = Math.min(
        ...[...validMasks]
          .filter((candidate) => (candidate & mask) === mask)
          .map((candidate) => countBits(candidate ^ mask)),
      )
      expect(validMasks.has(actual), `mask ${mask}`).toBe(true)
      expect(actual & mask).toBe(mask)
      expect(countBits(actual ^ mask)).toBe(minimum)
      expect(normalizeStitchLineSidesAndCorners(normalized)).toBe(normalized)
      expect(input).toEqual(before)
      if (validMasks.has(mask)) {
        expect(normalized).toBe(input)
      }
    }
  })

  it('permits exactly the toggles that preserve a contiguous boundary', () => {
    for (const mask of validMasks) {
      for (const [index, field] of STITCH_LINE_SIDE_AND_CORNER_ORDER.entries()) {
        expect(canToggleStitchLineSideOrCorner(sidesAndCorners(mask), field)).toBe(validMasks.has(mask ^ (1 << index)))
      }
    }
  })

  it('keeps isolated corners and forbids removing an internal side', () => {
    expect(normalizeStitchLineSidesAndCorners(sidesAndCorners(128)).topLeftCorner).toBe(true)
    const topWithCorners = sidesAndCorners(128 | 1 | 2)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'top')).toBe(false)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'topLeftCorner')).toBe(true)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'topRightCorner')).toBe(true)
  })
})
