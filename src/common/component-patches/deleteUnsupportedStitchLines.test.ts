import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { deleteUnsupportedStitchLines } from './deleteUnsupportedStitchLines'
describe('deleteUnsupportedStitchLines', () => {
  it.each([
    { children: [], keepsClusterLine: false },
    { children: ['t'], keepsClusterLine: false },
    { children: ['t', 'front'], keepsClusterLine: true },
  ])('keeps cluster stitching only with a front pocket: $children', ({ children, keepsClusterLine }) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster', 'panel'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
        d.panel({ id: 'panel' }),
      ],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'cluster-line', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'panel-line', targetId: 'panel', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'root-line', targetId: 'root', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'hole-line', targetId: 'hole', targetType: 'hole' }),
        d.componentBoundsStitchLine({ id: 'missing-line', targetId: 'missing', targetType: 'component' }),
        d.tPocketStitchLine({ id: 't-line', targetId: 't', targetType: 'component' }),
      ],
    })
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteUnsupportedStitchLines(source, computed)
    expect(result.stitchLines.map((line) => line.id)).toEqual([
      ...(keepsClusterLine ? ['cluster-line', 'shared'] : []),
      'panel-line',
      'root-line',
      'hole-line',
      'missing-line',
      't-line',
    ])
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(deleteUnsupportedStitchLines(result, computed)).toBe(result)
    expect(source).toEqual(snapshot)
    if (keepsClusterLine) {
      expect(result).toBe(source)
    }
  })

  it('only removes the unsupported data it owns and is idempotent', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'cluster-line', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'front-line', targetId: 'front', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'wrong-t-line', targetId: 't', targetType: 'component' }),
        d.tPocketStitchLine({ id: 't-line', targetId: 't', targetType: 'component' }),
      ],
    })
    const before = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteUnsupportedStitchLines(source, computed)
    expect(result.stitchLines.map((line) => line.id)).toEqual(['cluster-line', 'shared', 'front-line', 't-line'])
    expect(result.components).toBe(source.components)
    expect(deleteUnsupportedStitchLines(result, computed)).toBe(result)
    expect(source).toEqual(before)
  })
})
