import { describe, expect, it } from 'vitest'
import type { PocketSchema } from '../../../schemas/components'
import { d } from '../../../testData'
import { accessors } from '../../../utils/accessors'
import { cloneComponent } from '../cloneComponent'
import { deleteComponent } from '../deleteComponent'
import { flip } from '../flip'
import { updateComponent } from '../updateComponent'
import { applySubProjectLocks } from './applySubProjectLocks'

const fixture = () => {
  const a = d.tPocket({ id: 'a', opening: { type: 'slanted', side: 'start', offset: 5 }, itemCrossAxisOffset: 5 })
  const b = d.tPocket({ id: 'b', opening: { type: 'slanted', side: 'start', offset: 5 }, itemCrossAxisOffset: 5 })
  const c = d.tPocket({ id: 'c', opening: { type: 'slanted', side: 'start', offset: 5 }, itemCrossAxisOffset: 5 })
  const source = d.subProject({
    id: 'sp',
    root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
    components: [
      d.pocketCluster({ id: 'first', children: ['a', 'b'], orientation: 'up' }),
      d.pocketCluster({ id: 'second', children: ['c'], orientation: 'left' }),
      c,
      b,
      a,
    ],
  })
  source.locks.components = Object.fromEntries(
    [a, b, c].map((pocket) => [pocket.id, { 'pocket-opening': '1', 'pocket-contents': '2', 'pocket-stitching': '1' }]),
  )
  return { source, a, b, c }
}

describe('applySubProjectLocks', () => {
  it('does not rewrite operation results already matching the selected key', () => {
    const { source, a, b } = fixture()
    const opening = { type: 'straight' as const }
    let after = updateComponent(source, { component: { ...a, opening } })
    after = updateComponent(after, { component: { ...b, opening } })
    const result = applySubProjectLocks(source, after, accessors.subProject(source).rootPanel())
    expect(accessors.subProject(result.subProject).pocket('a')).toBe(accessors.subProject(after).pocket('a'))
    expect(accessors.subProject(result.subProject).pocket('b')).toBe(accessors.subProject(after).pocket('b'))
    expect(accessors.subProject(result.subProject).pocket('c')).not.toBe(accessors.subProject(after).pocket('c'))
    expect(result.adjustments).toEqual([])
  })

  it('propagates a single edit across clusters without a warning or geometry clamping', () => {
    const { source, c } = fixture()
    const after = updateComponent(source, {
      component: { ...c, opening: { type: 'slanted', side: 'end', offset: 1000 } },
    })
    const snapshot = structuredClone(source)
    const result = applySubProjectLocks(source, after, c)
    for (const id of ['a', 'b', 'c']) {
      expect(accessors.subProject(result.subProject).tPocket(id).opening).toEqual({
        type: 'slanted',
        side: 'end',
        offset: 1000,
      })
    }
    expect(result.adjustments).toEqual([])
    expect(source).toEqual(snapshot)
  })

  it('takes the first changed member in tree order, not record order, and reports overwritten operation results', () => {
    const { source, a, b, c } = fixture()
    let after = updateComponent(source, { component: { ...b, opening: { type: 'straight' } } })
    after = updateComponent(after, { component: { ...a, opening: { type: 'slanted', side: 'end', offset: 7 } } })
    const result = applySubProjectLocks(source, after, source.components.root)
    for (const id of ['a', 'b', 'c']) {
      expect(accessors.subProject(result.subProject).tPocket(id).opening).toEqual({
        type: 'slanted',
        side: 'end',
        offset: 7,
      })
    }
    expect(result.adjustments).toEqual([
      { group: '1', property: 'pocket-opening', sourceModelId: 'a', adjustedModelIds: ['b'] },
    ])
    expect(accessors.subProject(result.subProject).tPocket(c.id).itemCrossAxisOffset).toBe(5)
  })

  it('normalizes differing flip results instead of rejecting the operation', () => {
    const { source } = fixture()
    const after = flip(source, source.components.root, 'horizontal')
    const result = applySubProjectLocks(source, after, source.components.root)
    expect(accessors.subProject(after).tPocket('a').itemCrossAxisOffset).toBe(-5)
    expect(accessors.subProject(after).tPocket('c').itemCrossAxisOffset).toBe(5)
    expect(accessors.subProject(result.subProject).tPocket('c').itemCrossAxisOffset).toBe(-5)
  })

  it('keeps the original dialog order when the same operation reorders components', () => {
    const { source, a, b } = fixture()
    let after = updateComponent(source, { component: { ...b, opening: { type: 'straight' } } })
    after = updateComponent(after, { component: { ...a, opening: { type: 'slanted', side: 'end', offset: 7 } } })
    after = updateComponent(after, { component: { ...source.components.first, children: ['b', 'a'] } })
    const result = applySubProjectLocks(source, after, source.components.first)
    expect(accessors.subProject(result.subProject).tPocket('b').opening).toEqual({
      type: 'slanted',
      side: 'end',
      offset: 7,
    })
    expect(result.adjustments[0].sourceModelId).toBe('a')
  })

  it('propagates stitching creation, settings edits, and deletion as a complete ordered list', () => {
    const { source, a } = fixture()
    const line = d.tPocketStitchLine({ id: 'new-line', targetId: 'a', targetType: 'component', startOffset: 4 })
    const added = applySubProjectLocks(source, { ...source, stitchLines: [line] }, a).subProject
    expect(new Set(added.stitchLines.map((item) => item.id)).size).toBe(3)
    expect(added.stitchLines.map((item) => item.targetId)).toEqual(['a', 'b', 'c'])
    const changed = {
      ...added,
      stitchLines: added.stitchLines.map((item) => (item.targetId === 'b' ? { ...item, startOffset: 9 } : item)),
    }
    const edited = applySubProjectLocks(added, changed, changed.stitchLines[1]).subProject
    for (const pocket of ['a', 'b', 'c']) {
      expect(accessors.subProject(edited).tPocketStitchLines(pocket)[0].startOffset).toBe(9)
    }
    const deleted = applySubProjectLocks(
      edited,
      { ...edited, stitchLines: edited.stitchLines.filter((item) => item.targetId !== 'a') },
      line,
    ).subProject
    expect(deleted.stitchLines).toEqual([])
  })

  it('removes deleted memberships without deleting linked pockets or inheriting memberships on clone', () => {
    const { source, a } = fixture()
    const deleted = applySubProjectLocks(source, deleteComponent(source, { componentId: 'a' }), a).subProject
    expect(deleted.locks.components.a).toBeUndefined()
    expect(deleted.locks.components.b).toBeDefined()
    const cloned = cloneComponent(source, {
      componentId: 'a',
      ids: { component: () => 'clone', hole: () => 'clone-hole', stitchLine: () => 'clone-line' },
      names: { component: () => 'Clone', hole: () => 'Clone hole', stitchLine: () => 'Clone line' },
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    })
    const result = applySubProjectLocks(source, cloned, a).subProject
    expect(result.components.clone).toBeDefined()
    expect(result.locks.components.clone).toBeUndefined()
    expect(result.locks.components.a).toEqual(source.locks.components.a)
  })

  it('does not choose unchanged or unlinked pockets as sources', () => {
    const { source, b } = fixture()
    source.locks.components.b['pocket-contents'] = '3'
    const updated: PocketSchema = { ...b, itemCrossAxisOffset: 20 }
    const result = applySubProjectLocks(source, updateComponent(source, { component: updated }), b)
    expect(accessors.subProject(result.subProject).tPocket('a').itemCrossAxisOffset).toBe(5)
    expect(accessors.subProject(result.subProject).tPocket('b').itemCrossAxisOffset).toBe(20)
    expect(result.adjustments).toEqual([])
  })
})
