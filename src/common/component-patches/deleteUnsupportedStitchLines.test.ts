import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { deleteUnsupportedStitchLines } from './deleteUnsupportedStitchLines'
describe('deleteUnsupportedStitchLines', () => {
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
        d.componentBoundsStitchLine({ id: 'front-line', targetId: 'front', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'wrong-t-line', targetId: 't', targetType: 'component' }),
        d.tPocketStitchLine({ id: 't-line', targetId: 't', targetType: 'component' }),
      ],
    })
    const before = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteUnsupportedStitchLines(source, computed)
    expect(result.stitchLines.map((line) => line.id)).toEqual(['cluster-line', 't-line'])
    expect(result.components).toBe(source.components)
    expect(deleteUnsupportedStitchLines(result, computed)).toBe(result)
    expect(source).toEqual(before)
  })
})
