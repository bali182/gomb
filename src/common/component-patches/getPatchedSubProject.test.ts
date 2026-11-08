import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { getPatchedSubProject } from './getPatchedSubProject'

const fixture = () => {
  const first = d.pocketCluster({ id: 'first', children: ['a', 'front-a'] })
  const second = d.pocketCluster({ id: 'second', children: ['b', 'front-b'] })
  return d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
    components: [
      first,
      second,
      d.tPocket({ id: 'a' }),
      d.tPocket({ id: 'b' }),
      d.frontPocket({ id: 'front-a', children: ['child'] }),
      d.frontPocket({ id: 'front-b' }),
      d.panel({ id: 'child' }),
    ],
  })
}

describe('getPatchedSubProject', () => {
  it('keeps cluster stitching after the last T-pocket is removed', () => {
    const source = fixture()
    source.components.first.children = ['front-a']
    delete source.components.a
    source.stitchLines = [d.tPocketStitchLine({ id: 'line', targetId: 'first', targetType: 'component' })]
    const snapshot = structuredClone(source)
    const patched = getPatchedSubProject(source, getComputedSubProject(source, defaultStitchingSettings))
    expect(patched.stitchLines).toEqual(source.stitchLines)
    expect(source).toEqual(snapshot)
  })

  it('removes stitching after its target cluster is removed', () => {
    const source = fixture()
    source.components.root.children = ['second']
    delete source.components.first
    delete source.components.a
    delete source.components['front-a']
    delete source.components.child
    source.stitchLines = [d.tPocketStitchLine({ id: 'line', targetId: 'first', targetType: 'component' })]
    const snapshot = structuredClone(source)
    const patched = getPatchedSubProject(source, getComputedSubProject(source, defaultStitchingSettings))
    expect(patched.stitchLines).toEqual([])
    expect(source).toEqual(snapshot)
  })
})
