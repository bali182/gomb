import { describe, expect, it } from 'vitest'
import {
  createPocketLocksDraft,
  selectPocketLockSample,
  setPocketLockMembership,
} from '../../components/pocket-locks/pocketLocksDraftUtils'
import { pocketLockProperties } from '../../schemas/lock'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { updatePocketLocks } from './updatePocketLocks'

describe('updatePocketLocks', () => {
  it('leaves matching pocket objects and stitch lines untouched', () => {
    const a = d.tPocket({ id: 'a' }),
      b = d.tPocket({ id: 'b' })
    const line = d.tPocketStitchLine({ id: 'a-line', targetId: 'a', targetType: 'component' })
    const source = d.subProject({
      id: 'sp',
      root: d.rootPanel({ id: 'root', children: ['a', 'b'] }),
      components: [a, b],
      stitchLines: [line, { ...line, id: 'b-line', targetId: 'b' }],
    })
    const draft = setPocketLockMembership(
      source,
      createPocketLocksDraft(source),
      ['a', 'b'],
      pocketLockProperties,
      '1',
      true,
    )
    const result = updatePocketLocks(source, draft)
    expect(result.components).toBe(source.components)
    expect(result.stitchLines).toBe(source.stitchLines)
  })

  it('reads all selected source lists from the original subproject before cross-group writes', () => {
    const a = d.tPocket({ id: 'a' }),
      b = d.tPocket({ id: 'b' })
    const source = d.subProject({
      id: 'sp',
      root: d.rootPanel({ id: 'root', children: ['a', 'b'] }),
      components: [a, b],
      stitchLines: [
        d.tPocketStitchLine({ id: 'a-line', targetId: 'a', targetType: 'component', startOffset: 1 }),
        d.tPocketStitchLine({ id: 'b-line', targetId: 'b', targetType: 'component', startOffset: 2 }),
      ],
    })
    let draft = setPocketLockMembership(source, createPocketLocksDraft(source), ['a'], ['pocket-stitching'], '1', true)
    draft = setPocketLockMembership(source, draft, ['b'], ['pocket-stitching'], '2', true)
    draft = selectPocketLockSample(source, draft, b, 'pocket-stitching', '1')
    draft = selectPocketLockSample(source, draft, a, 'pocket-stitching', '2')
    const result = updatePocketLocks(source, draft)
    expect(accessors.subProject(result).tPocketStitchLines('a')[0]).toMatchObject({ id: 'a-line', startOffset: 2 })
    expect(accessors.subProject(result).tPocketStitchLines('b')[0]).toMatchObject({ id: 'b-line', startOffset: 1 })
    expect(accessors.subProject(source).tPocketStitchLines('a')[0].startOffset).toBe(1)
  })

  it('rejects a missing sample without mutating the original subproject', () => {
    const a = d.tPocket({ id: 'a' })
    const source = d.subProject({ id: 'sp', root: d.rootPanel({ id: 'root', children: ['a'] }), components: [a] })
    const snapshot = structuredClone(source)
    const draft = setPocketLockMembership(source, createPocketLocksDraft(source), ['a'], ['pocket-opening'], '1', true)
    draft.sampleKeys['1'] = { 'pocket-opening': 'missing-sample-key' }
    expect(() => updatePocketLocks(source, draft)).toThrow('Missing pocket lock sample')
    expect(source).toEqual(snapshot)
  })

  it('applies independent source values across clusters without persisting a source object', () => {
    const a = d.tPocket({
      id: 'a',
      opening: { type: 'slanted', side: 'start', offset: 9 },
      itemId: 'ID-1',
      tPocketTabWidth: 10,
    })
    const b = d.tPocket({ id: 'b', opening: { type: 'straight' }, itemId: 'ID-2', tPocketTabWidth: 20 })
    const source = d.subProject({
      id: 'sp',
      root: d.rootPanel({ id: 'root', children: ['left', 'right'] }),
      components: [
        d.pocketCluster({ id: 'left', children: ['a'] }),
        d.pocketCluster({ id: 'right', children: ['b'] }),
        a,
        b,
      ],
      stitchLines: [d.tPocketStitchLine({ id: 'a-line', targetId: 'a', targetType: 'component', startOffset: 3 })],
    })
    const snapshot = structuredClone(source)
    let draft = setPocketLockMembership(
      source,
      createPocketLocksDraft(source),
      ['a', 'b'],
      pocketLockProperties,
      '1',
      true,
    )
    draft = selectPocketLockSample(source, draft, b, 'pocket-contents', '1')
    draft = selectPocketLockSample(source, draft, b, 'pocket-shape', '1')
    const result = updatePocketLocks(source, draft)
    const pockets = accessors.subProject(result)
    expect(pockets.tPocket('a')).toMatchObject({ itemId: 'ID-2', tPocketTabWidth: 20, opening: a.opening })
    expect(pockets.tPocket('b')).toMatchObject({ itemId: 'ID-2', tPocketTabWidth: 20, opening: a.opening })
    const aLines = accessors.subProject(result).tPocketStitchLines('a')
    const bLines = accessors.subProject(result).tPocketStitchLines('b')
    expect(aLines[0].id).toBe('a-line')
    expect(bLines[0]).toMatchObject({ targetId: 'b', startOffset: 3 })
    expect(bLines[0].id).not.toBe(aLines[0].id)
    expect(result.locks).toEqual(draft.locks)
    expect(result.locks).not.toHaveProperty('samples')
    expect(source).toEqual(snapshot)
  })

  it('uses an empty stitching list as a valid source and clears all linked lists', () => {
    const a = d.tPocket({ id: 'a' }),
      b = d.tPocket({ id: 'b' })
    const source = d.subProject({
      id: 'sp',
      root: d.rootPanel({ id: 'root', children: ['a', 'b'] }),
      components: [a, b],
      stitchLines: [d.tPocketStitchLine({ id: 'line', targetId: 'b', targetType: 'component' })],
    })
    const draft = setPocketLockMembership(
      source,
      createPocketLocksDraft(source),
      ['a', 'b'],
      ['pocket-stitching'],
      '2',
      true,
    )
    expect(updatePocketLocks(source, draft).stitchLines).toEqual([])
  })
})
