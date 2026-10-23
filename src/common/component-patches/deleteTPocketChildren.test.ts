import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { deleteTPocketChildren } from './deleteTPocketChildren'
describe('deleteTPocketChildren', () => {
  it('only removes the unsupported data it owns and is idempotent', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't', children: ['child'] }),
        d.frontPocket({ id: 'front' }),
        d.panel({ id: 'child', children: ['nested'] }),
        d.panel({ id: 'nested' }),
      ],
    })
    const before = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteTPocketChildren(source, computed)
    expect(result.components.child).toBeUndefined()
    expect(result.components.nested).toBeUndefined()
    expect(result.components.t.children).toEqual([])
    expect(result.components.front).toBe(source.components.front)
    expect(deleteTPocketChildren(result, computed)).toBe(result)
    expect(source).toEqual(before)
  })
})
