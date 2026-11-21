import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON } from '../constants/layout'
import { defaultStitchingSettings } from '../defaultStates'
import { d } from '../testData'
import { getComputedSubProject } from './getComputedSubProject'

describe('hole dimensions', () => {
  it.each([false, true])('uses the owner final width when autoWidth is %s', (autoWidth) => {
    for (const autoHeight of [false, true]) {
      const hole = d.hole({
        id: 'hole',
        componentId: 'panel',
        width: 20,
        height: 30,
        autoWidth,
        autoHeight,
        xAnchor: 'middle',
        yAnchor: 'end',
        xOffset: 7,
        yOffset: 9,
        leftStretch: 2,
        rightStretch: 3,
        topStretch: -4,
        bottomStretch: 6,
      })
      const source = d.subProject({
        id: 'sub',
        root: d.rootPanel({ id: 'root', width: 100, height: 80 }),
        frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
        components: [d.panel({ id: 'panel', leftStretch: 10, rightStretch: 20, topStretch: 5, bottomStretch: 15 })],
        holes: [hole],
      })
      const computed = getComputedSubProject(source, defaultStitchingSettings)
      const owner = computed.components.panel.boundingRect
      const result = computed.holes.hole
      const width = autoWidth ? 130 : 20
      const height = autoHeight ? 100 : 30
      expect(result.layoutBoundingRect.width.toNumber()).toBe(width)
      expect(result.layoutBoundingRect.height.toNumber()).toBe(height)
      expect(result.layoutBoundingRect.x.toNumber()).toBe(owner.x.toNumber() + (130 - width) / 2 + 7)
      expect(result.layoutBoundingRect.y.toNumber()).toBe(owner.y.toNumber() + 100 - height - 9)
      expect(result.boundingRect.x.toNumber()).toBe(result.layoutBoundingRect.x.toNumber() - 2)
      expect(result.boundingRect.y.toNumber()).toBe(result.layoutBoundingRect.y.toNumber() + 4)
      expect(result.boundingRect.width.toNumber()).toBe(width + 5)
      expect(result.boundingRect.height.toNumber()).toBe(height + 2)
      expect(computed.limits.holes.hole.leftStretch?.min?.value.toNumber()).toBeCloseTo(
        -(width + 3 - POSITION_EPSILON),
        10,
      )
      expect(computed.limits.holes.hole.topLeftRadius?.max?.value.toNumber()).toBe(Math.min(width + 5, height + 2))
    }
  })

  it.each(['width', 'height'] as const)('computes finite geometry and stitching for zero %s', (field) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [d.hole({ id: 'hole', componentId: 'root-front', [field]: 0 })],
      stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole' })],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.holes.hole.layoutBoundingRect[field].toNumber()).toBe(POSITION_EPSILON)
    expect(computed.holes.hole.boundingRect[field].toNumber()).toBe(POSITION_EPSILON)
    expect(JSON.stringify(computed)).not.toMatch(/NaN|Infinity/)
    expect(computed.stitchLines.stitch).toBeDefined()
  })

  it('limits excessive compression on both axes without changing requested stretch', () => {
    const hole = d.hole({
      id: 'hole',
      componentId: 'root-front',
      leftStretch: -100,
      rightStretch: -200,
      topStretch: -300,
      bottomStretch: -400,
    })
    const source = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), holes: [hole] })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.holes.hole.boundingRect.width.toNumber()).toBe(POSITION_EPSILON)
    expect(computed.holes.hole.boundingRect.height.toNumber()).toBe(POSITION_EPSILON)
    expect(hole.leftStretch).toBe(-100)
    expect(computed.limits.holes.hole.leftStretch?.min?.severity).toBe('warning')
    expect(JSON.stringify(computed)).not.toMatch(/NaN|Infinity/)
  })
})
