import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { deletePocketClusterHoles } from './deletePocketClusterHoles'
describe('deletePocketClusterHoles', () => {
  it('only removes the unsupported data it owns and is idempotent', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [d.pocketCluster({ id: 'cluster', children: ['front'] }), d.frontPocket({ id: 'front' })],
      holes: [d.hole({ id: 'invalid', componentId: 'cluster' }), d.hole({ id: 'valid', componentId: 'front' })],
    })
    const before = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deletePocketClusterHoles(source, computed)
    expect(result.holes.map((hole) => hole.id)).toEqual(['valid'])
    expect(result.components).toBe(source.components)
    expect(deletePocketClusterHoles(result, computed)).toBe(result)
    expect(source).toEqual(before)
  })
})
