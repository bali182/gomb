import { describe, expect, it } from 'vitest'
import type { HasStitchedCornersSchema, HasStitchedSidesSchema } from '../../schemas/stitching'
import {
  canToggleStitchLineSideOrCorner,
  normalizeStitchLineSidesAndCorners,
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  toggleStitchLineSideOrCorner,
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

  it('applies the permitted additions and removals for every valid boundary without mutating the input', () => {
    for (const mask of validMasks) {
      const endpointMask = STITCH_LINE_SIDE_AND_CORNER_ORDER.reduce((endpoints, _, index) => {
        const bit = 1 << index
        return (mask & bit) !== 0 && validMasks.has(mask ^ bit) ? endpoints | bit : endpoints
      }, 0)
      for (const [index, field] of STITCH_LINE_SIDE_AND_CORNER_ORDER.entries()) {
        const bit = 1 << index
        const selected = (mask & bit) !== 0
        const updatedMask = mask ^ bit
        const adjacentMask = (1 << ((index + 1) % 8)) | (1 << ((index + 7) % 8))
        const adjacentEndpoints = adjacentMask & endpointMask
        const sameKindNeighbors = (1 << ((index + 2) % 8)) | (1 << ((index + 6) % 8))
        const canExtend = !selected && (mask & sameKindNeighbors) !== 0
        const canRemoveWithEndpoint = selected && adjacentEndpoints !== 0
        const expected = validMasks.has(updatedMask) || canExtend || canRemoveWithEndpoint
        const input = sidesAndCorners(mask)
        const before = { ...input }
        const context = `mask ${mask}, field ${field}`
        expect(canToggleStitchLineSideOrCorner(input, field), context).toBe(expected)
        const updated = toggleStitchLineSideOrCorner(input, field)
        const actual = toMask(updated)
        expect(input, context).toEqual(before)
        if (!expected) {
          expect(updated, context).toBe(input)
          continue
        }
        expect(validMasks.has(actual), context).toBe(true)
        expect(updated[field], context).toBe(!selected)
        const sameKindMask = index % 2 === 0 ? 0b01010101 : 0b10101010
        expect(actual & sameKindMask, context).toBe(updatedMask & sameKindMask)
        if (validMasks.has(updatedMask)) {
          expect(actual, context).toBe(updatedMask)
        } else if (selected) {
          expect(actual, context).toBe(updatedMask & ~adjacentEndpoints)
        } else if (countBits(mask) === 5 && (mask & adjacentMask) === 0) {
          expect(actual, context).toBe(255)
        } else {
          expect(actual, context).toBe(toMask(normalizeStitchLineSidesAndCorners(sidesAndCorners(updatedMask))))
        }
        expect(countBits(actual ^ mask), context).toBeLessThanOrEqual(3)
        if (selected) {
          expect(actual & mask, context).toBe(actual)
        } else {
          expect(actual & mask, context).toBe(mask)
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
      const updated = toggleStitchLineSideOrCorner(input, field)
      expect(toMask(updated)).toBe((1 << index) | (1 << adjacentIndex) | (1 << connectorIndex))
    }
    expect(canToggleStitchLineSideOrCorner(input, STITCH_LINE_SIDE_AND_CORNER_ORDER[(index + 4) % 8])).toBe(false)
  })

  it('leaves corners unchanged when adding a side already produces a contiguous boundary', () => {
    const input = sidesAndCorners(1 | 2)
    expect(canToggleStitchLineSideOrCorner(input, 'right')).toBe(true)
    expect(toMask(toggleStitchLineSideOrCorner(input, 'right'))).toBe(1 | 2 | 4)
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
    expect(toMask(toggleStitchLineSideOrCorner(input, 'bottomRightCorner'))).toBe(2 | 4 | 8)
  })

  it('adds only one connecting side when enabling the fourth corner needs a repair', () => {
    const input = sidesAndCorners(2 | 4 | 8 | 16 | 32)
    expect(canToggleStitchLineSideOrCorner(input, 'topLeftCorner')).toBe(true)
    const updated = normalizeStitchLineSidesAndCorners({ ...input, topLeftCorner: true })
    expect(updated.left).toBe(true)
    expect(updated.top).toBe(false)
    expect(toMask(updated)).toBe(255 ^ 1)
  })

  it.each([0, 1, 2, 3, 4, 5, 6, 7])('handles removals and closing gaps around index %i', (index) => {
    const field = STITCH_LINE_SIDE_AND_CORNER_ORDER[index]
    const previous = 1 << ((index + 7) % 8)
    const current = 1 << index
    const next = 1 << ((index + 1) % 8)
    const afterNext = 1 << ((index + 2) % 8)
    const beforePrevious = 1 << ((index + 6) % 8)
    const triple = previous | current | next

    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(current | next), field))).toBe(next)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(previous | current), field))).toBe(previous)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(current), field))).toBe(0)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(triple), field))).toBe(0)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(triple | afterNext), field))).toBe(next | afterNext)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(triple | beforePrevious), field))).toBe(
      previous | beforePrevious,
    )

    const internal = sidesAndCorners(triple | beforePrevious | afterNext)
    expect(canToggleStitchLineSideOrCorner(internal, field)).toBe(false)
    expect(toggleStitchLineSideOrCorner(internal, field)).toBe(internal)

    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(255 ^ triple), field))).toBe(255)
    expect(toMask(toggleStitchLineSideOrCorner(sidesAndCorners(255), field))).toBe(255 ^ current)
  })

  it('preserves unrelated fields when toggling', () => {
    const input = { ...sidesAndCorners(1 | 2 | 4), id: 'stitch-line', startOffset: 5 }
    const updated = toggleStitchLineSideOrCorner(input, 'topRightCorner')
    expect(updated).toEqual({ ...sidesAndCorners(0), id: 'stitch-line', startOffset: 5 })
    expect(input).toEqual({ ...sidesAndCorners(1 | 2 | 4), id: 'stitch-line', startOffset: 5 })
  })
})
