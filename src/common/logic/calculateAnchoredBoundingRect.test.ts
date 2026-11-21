import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { d } from '../testData'
import { calculateAnchoredBoundingRect } from './calculateAnchoredBoundingRect'

describe('calculateAnchoredBoundingRect', () => {
  it.each(['start', 'middle', 'end'] as const)('uses identical %s anchor semantics for Guide and hole', (anchor) => {
    const owner = { x: new BigNumber(10), y: new BigNumber(20), width: new BigNumber(100), height: new BigNumber(80) }
    const dimensions = {
      autoWidth: false,
      autoHeight: false,
      width: 30,
      height: 20,
      xAnchor: anchor,
      yAnchor: anchor,
      xOffset: 5,
      yOffset: -7,
    }
    const guide = calculateAnchoredBoundingRect(d.guide({ id: 'guide', ...dimensions }), owner)
    const hole = calculateAnchoredBoundingRect(d.hole({ id: 'hole', componentId: 'root-front', ...dimensions }), owner)
    expect(guide).toEqual(hole)
    expect(guide.x.toNumber()).toBe(anchor === 'start' ? 15 : anchor === 'middle' ? 50 : 75)
    expect(guide.y.toNumber()).toBe(anchor === 'start' ? 13 : anchor === 'middle' ? 43 : 87)
  })
})
