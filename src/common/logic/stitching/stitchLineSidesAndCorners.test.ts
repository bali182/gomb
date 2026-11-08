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

  it('treats a gap crossing the end of the field order as one gap', () => {
    const input = sidesAndCorners(4 | 64)
    const normalized = normalizeStitchLineSidesAndCorners(input)
    expect(toMask(normalized)).toBe(255 ^ (8 | 16 | 32))
  })

  it('preserves the earliest canonical gap when traversal encounters an equal gap first', () => {
    const input = sidesAndCorners(4 | 32 | 64 | 128)
    const normalized = normalizeStitchLineSidesAndCorners(input)
    expect(toMask(normalized)).toBe(255 ^ (1 | 2))
  })

  it('permits contiguous toggles and additions beside selected elements of the same kind for every valid boundary', () => {
    for (const mask of validMasks) {
      for (const [index, field] of STITCH_LINE_SIDE_AND_CORNER_ORDER.entries()) {
        const updatedMask = mask ^ (1 << index)
        const adjacentElements = (1 << ((index + 2) % 8)) | (1 << ((index + 6) % 8))
        const addsAdjacentElement = (mask & (1 << index)) === 0 && (mask & adjacentElements) !== 0
        const expected = validMasks.has(updatedMask) || addsAdjacentElement
        expect(canToggleStitchLineSideOrCorner(sidesAndCorners(mask), field), `mask ${mask}, field ${field}`).toBe(
          expected,
        )
        if (expected) {
          const updated = normalizeStitchLineSidesAndCorners(sidesAndCorners(updatedMask))
          expect(validMasks.has(toMask(updated)), `mask ${mask}, field ${field}`).toBe(true)
          const sameKindMask = index % 2 === 0 ? 0b01010101 : 0b10101010
          expect(toMask(updated) & sameKindMask, `extra changes for mask ${mask}, field ${field}`).toBe(
            updatedMask & sameKindMask,
          )
          if (validMasks.has(updatedMask)) {
            expect(toMask(updated)).toBe(updatedMask)
          }
        }
      }
    }
  })

  it.each([0, 1, 2, 3, 4, 5, 6, 7])('connects adjacent elements of the same kind from index %i', (index) => {
    const input = sidesAndCorners(1 << index)
    for (const direction of [-1, 1]) {
      const adjacentIndex = (index + 2 * direction + 8) % 8
      const connectorIndex = (index + direction + 8) % 8
      const field = STITCH_LINE_SIDE_AND_CORNER_ORDER[adjacentIndex]
      expect(canToggleStitchLineSideOrCorner(input, field)).toBe(true)
      const updated = normalizeStitchLineSidesAndCorners({ ...input, [field]: true })
      expect(toMask(updated)).toBe((1 << index) | (1 << adjacentIndex) | (1 << connectorIndex))
    }
    expect(canToggleStitchLineSideOrCorner(input, STITCH_LINE_SIDE_AND_CORNER_ORDER[(index + 4) % 8])).toBe(false)
  })

  it('leaves corners unchanged when adding a side already produces a contiguous boundary', () => {
    const input = sidesAndCorners(1 | 2)
    expect(canToggleStitchLineSideOrCorner(input, 'right')).toBe(true)
    const updated = { ...input, right: true }
    expect(normalizeStitchLineSidesAndCorners(updated)).toBe(updated)
  })

  it('adds only one connecting corner when enabling the fourth side needs a repair', () => {
    const input = sidesAndCorners(1 | 2 | 4 | 8 | 16)
    expect(canToggleStitchLineSideOrCorner(input, 'left')).toBe(true)
    const updated = normalizeStitchLineSidesAndCorners({ ...input, left: true })
    expect(updated.topLeftCorner).toBe(true)
    expect(updated.bottomLeftCorner).toBe(false)
    expect(toMask(updated)).toBe(255 ^ 32)
  })

  it('leaves sides unchanged when adding a corner already produces a contiguous boundary', () => {
    const input = sidesAndCorners(2 | 4)
    expect(canToggleStitchLineSideOrCorner(input, 'bottomRightCorner')).toBe(true)
    const updated = { ...input, bottomRightCorner: true }
    expect(normalizeStitchLineSidesAndCorners(updated)).toBe(updated)
  })

  it('adds only one connecting side when enabling the fourth corner needs a repair', () => {
    const input = sidesAndCorners(2 | 4 | 8 | 16 | 32)
    expect(canToggleStitchLineSideOrCorner(input, 'topLeftCorner')).toBe(true)
    const updated = normalizeStitchLineSidesAndCorners({ ...input, topLeftCorner: true })
    expect(updated.left).toBe(true)
    expect(updated.top).toBe(false)
    expect(toMask(updated)).toBe(255 ^ 1)
  })

  it('keeps isolated corners and forbids removing an internal side', () => {
    expect(normalizeStitchLineSidesAndCorners(sidesAndCorners(128)).topLeftCorner).toBe(true)
    const topWithCorners = sidesAndCorners(128 | 1 | 2)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'top')).toBe(false)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'topLeftCorner')).toBe(true)
    expect(canToggleStitchLineSideOrCorner(topWithCorners, 'topRightCorner')).toBe(true)
    const topAndRight = sidesAndCorners(1 | 2 | 4)
    expect(canToggleStitchLineSideOrCorner(topAndRight, 'topRightCorner')).toBe(false)
  })
})
