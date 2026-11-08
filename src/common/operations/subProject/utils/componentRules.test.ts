import { describe, expect, it } from 'vitest'
import { d } from '../../../testData'
import { accessors } from '../../../utils/accessors'
import {
  canAddChild,
  canAddStitchLine,
  canCloneComponent,
  canDeleteComponent,
  canMoveComponent,
} from './componentRules'

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

describe('canAddChild', () => {
  it('leaves child type and duplicate front restrictions to the component rules', () => {
    const source = fixture()
    expect(canAddChild(source.components.first, 't-pocket', source)).toBe(true)
    expect(canAddChild(source.components.first, 'front-pocket', source)).toBe(false)
    expect(canAddChild(source.components.first, 'panel', source)).toBe(false)
    expect(canAddChild(source.components.a, 'panel', source)).toBe(false)
  })
  it('only permits adding a front pocket while a cluster has no front pocket', () => {
    const source = fixture()
    source.components.empty = d.pocketCluster({ id: 'empty' })
    source.components.root.children.push('empty')
    const cluster = source.components.empty
    expect(canAddChild(cluster, 't-pocket', source)).toBe(false)
    expect(canAddChild(cluster, 'front-pocket', source)).toBe(true)
    expect(canAddChild(cluster, 'panel', source)).toBe(false)
    source.components.empty = { ...source.components.empty, children: ['new-front'] }
    source.components['new-front'] = d.frontPocket({ id: 'new-front' })
    expect(canAddChild(source.components.empty, 't-pocket', source)).toBe(true)
    expect(canAddChild(source.components.empty, 'front-pocket', source)).toBe(false)
  })
  it('also rejects T-pockets when existing children contain no front pocket', () => {
    const source = fixture()
    source.components.first.children = ['a']
    expect(canAddChild(source.components.first, 't-pocket', source)).toBe(false)
    expect(canAddChild(source.components.first, 'front-pocket', source)).toBe(true)
  })
})

describe('canAddStitchLine', () => {
  it('permits stitching only on supported components and clusters with a front pocket', () => {
    const source = fixture()
    const empty = d.pocketCluster({ id: 'empty' })
    const withoutFront = d.pocketCluster({ id: 'without-front', children: ['a'] })
    expect(canAddStitchLine(empty, source, 'component-bounds-stitch-line')).toBe(false)
    expect(canAddStitchLine(withoutFront, source, 'component-bounds-stitch-line')).toBe(false)
    expect(canAddStitchLine(source.components.first, source, 'component-bounds-stitch-line')).toBe(true)
    expect(canAddStitchLine(source.components['front-a'], source, 'component-bounds-stitch-line')).toBe(true)
    expect(canAddStitchLine(source.components.a, source, 't-pocket-stitch-line')).toBe(true)
    expect(canAddStitchLine(source.components.root, source, 'component-bounds-stitch-line')).toBe(true)
    expect(canAddStitchLine(source.components.child, source, 'component-bounds-stitch-line')).toBe(true)
  })
  it('permits both stitch types on a populated pocket cluster', () => {
    const source = fixture()
    expect(canAddStitchLine(source.components.first, source, 't-pocket-stitch-line')).toBe(true)
    expect(canAddStitchLine(source.components.first, source, 'component-bounds-stitch-line')).toBe(true)
  })
})

describe('canDeleteComponent', () => {
  it('protects a front pocket while its cluster contains T-pockets', () => {
    const source = fixture()
    expect(canDeleteComponent(accessors.subProject(source).component.frontPocket('front-a'), source)).toBe(false)
  })
  it('permits deleting a lone front pocket', () => {
    const source = fixture()
    source.components.first.children = ['front-a']
    delete source.components.a
    expect(canDeleteComponent(accessors.subProject(source).component.frontPocket('front-a'), source)).toBe(true)
  })
})

describe('canCloneComponent', () => {
  it('keeps a lone front pocket uncloneable', () => {
    const source = fixture()
    source.components.first.children = ['front-a']
    delete source.components.a
    expect(canCloneComponent(accessors.subProject(source).component.frontPocket('front-a'))).toBe(false)
  })
})

describe('canMoveComponent', () => {
  it('only permits moving T-pockets into a cluster after its front pocket exists', () => {
    const source = fixture()
    source.components.empty = d.pocketCluster({ id: 'empty' })
    source.components.root.children.push('empty')
    expect(canMoveComponent(source, { id: 'a', targetParentId: 'empty', beforeComponentId: undefined })).toBe(false)
    source.components.empty = { ...source.components.empty, children: ['new-front'] }
    source.components['new-front'] = d.frontPocket({ id: 'new-front' })
    expect(canMoveComponent(source, { id: 'a', targetParentId: 'empty', beforeComponentId: 'new-front' })).toBe(true)
  })
  it('keeps lone front pockets and the root immovable', () => {
    const source = fixture()
    source.components.empty = d.pocketCluster({ id: 'empty' })
    source.components.root.children.push('empty')
    source.components.first.children = ['front-a']
    delete source.components.a
    const snapshot = structuredClone(source)
    const move = { id: 'front-a', targetParentId: 'empty', beforeComponentId: undefined }
    expect(canMoveComponent(source, move)).toBe(false)
    expect(canMoveComponent(source, { ...move, id: source.root })).toBe(false)
    expect(source).toEqual(snapshot)
  })
})
