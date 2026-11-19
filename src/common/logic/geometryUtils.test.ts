import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { PathSchema, PointSchema, RectSchema } from '../schemas/geometry'
import { calculateRectPath } from './calculateRectPath'
import {
  getHorizontalReflectionTransform,
  reflectPathHorizontally,
  reflectPointHorizontally,
  reflectRectHorizontally,
} from './geometryUtils'
import { isPointInClosedPath } from './isPointInClosedPath'

const point = (x: number, y: number): PointSchema => ({ x: new BigNumber(x), y: new BigNumber(y) })

const rect: RectSchema = {
  x: new BigNumber(20),
  y: new BigNumber(30),
  width: new BigNumber(80),
  height: new BigNumber(60),
}

const roundedPath = (): PathSchema =>
  calculateRectPath(rect, {
    topLeft: new BigNumber(5),
    topRight: new BigNumber(10),
    bottomLeft: new BigNumber(15),
    bottomRight: new BigNumber(20),
  })

describe('horizontal reflection', () => {
  it('reflects points and rectangles around an offset axis without changing their dimensions or source', () => {
    const axisX = new BigNumber(70)
    const sourcePoint = point(30, 10)
    expect(reflectPointHorizontally(sourcePoint, axisX)).toEqual(point(110, 10))
    expect(reflectPointHorizontally(reflectPointHorizontally(sourcePoint, axisX), axisX)).toEqual(sourcePoint)
    expect(reflectRectHorizontally(rect, axisX)).toEqual({ ...rect, x: new BigNumber(40) })
    expect(reflectRectHorizontally(reflectRectHorizontally(rect, axisX), axisX)).toEqual(rect)
    expect(sourcePoint).toEqual(point(30, 10))
    expect(rect.x.toNumber()).toBe(20)
    expect(getHorizontalReflectionTransform(axisX)).toBe('matrix(-1 0 0 1 140 0)')
  })

  it('reflects every path command and reverses arc sweeps', () => {
    const source = roundedPath()
    const axisX = new BigNumber(60)
    const reflected = reflectPathHorizontally(source, axisX)
    expect(reflected.commands).toHaveLength(source.commands.length)
    source.commands.forEach((command, index) => {
      const mirrored = reflected.commands[index]
      switch (command.type) {
        case 'moveTo':
        case 'lineTo':
          expect(mirrored).toEqual({
            ...command,
            point: point(120 - command.point.x.toNumber(), command.point.y.toNumber()),
          })
          break
        case 'arcTo':
          expect(mirrored).toEqual({
            ...command,
            point: point(120 - command.point.x.toNumber(), command.point.y.toNumber()),
            reversed: !command.reversed,
          })
          break
        case 'close':
          expect(mirrored).toEqual(command)
          break
      }
    })
    expect(reflectPathHorizontally(reflected, axisX)).toEqual(source)
    expect(source).toEqual(roundedPath())
  })

  it.each([
    [21, 31],
    [24, 34],
    [60, 60],
    [95, 85],
    [110, 60],
  ])('preserves rounded contour membership for the reflected point (%s, %s)', (x, y) => {
    const source = roundedPath()
    const axisX = new BigNumber(70)
    expect(
      isPointInClosedPath(reflectPointHorizontally(point(x, y), axisX), reflectPathHorizontally(source, axisX)),
    ).toBe(isPointInClosedPath(point(x, y), source))
  })

  it('handles empty paths', () => {
    expect(reflectPathHorizontally({ commands: [] }, new BigNumber(50))).toEqual({ commands: [] })
  })
})
