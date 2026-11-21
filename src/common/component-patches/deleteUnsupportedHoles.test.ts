import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { deleteUnsupportedHoles } from './deleteUnsupportedHoles'
describe('deleteUnsupportedHoles', () => {
  it('only removes the unsupported data it owns and is idempotent', () => {
    const source = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.pocketCluster({ id: 'cluster', children: ['front'] }), d.frontPocket({ id: 'front' })],
      holes: [d.hole({ id: 'invalid', componentId: 'cluster' }), d.hole({ id: 'valid', componentId: 'front' })],
    })
    const before = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteUnsupportedHoles(source, computed)
    expect(result.holes.map((hole) => hole.id)).toEqual(['valid'])
    expect(result.components).toBe(source.components)
    expect(deleteUnsupportedHoles(result, computed)).toBe(result)
    expect(source).toEqual(before)
  })
})
