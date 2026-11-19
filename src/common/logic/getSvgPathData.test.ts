import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { PathSchema } from '../schemas/geometry'
import { reflectPathHorizontally } from './geometryUtils'
import { getSvgLinePathData, getSvgPathData } from './getSvgPathData'

const point = (x: number, y: number) => ({ x: new BigNumber(x), y: new BigNumber(y) })

describe('reflected SVG geometry', () => {
  it.each([false, true])('serializes reflected line and circular arc commands, reversed: %s', (reversed) => {
    const path: PathSchema = {
      commands: [
        { type: 'moveTo', point: point(5, 10) },
        { type: 'lineTo', point: point(12, 10) },
        { type: 'arcTo', point: point(18, 16), radius: new BigNumber(6), reversed },
        { type: 'close' },
      ],
    }
    const before = structuredClone(path)
    const axis = new BigNumber(40)
    expect(getSvgPathData(path, axis)).toBe(getSvgPathData(reflectPathHorizontally(path, axis)))
    expect(getSvgPathData(path, axis)).toContain('M 75 10 L 68 10')
    expect(getSvgPathData(path, axis)).toContain(`A 6 6 0 0 ${reversed ? 1 : 0} 62 16`)
    expect(path).toEqual(before)
  })

  it('reflects the complete hole or thread segment without exchanging its ends', () => {
    const line = { start: point(3, 4), end: point(7, 9) }
    expect(getSvgLinePathData(line)).toBe('M 3 4 L 7 9')
    expect(getSvgLinePathData(line, new BigNumber(20))).toBe('M 37 4 L 33 9')
  })
})
