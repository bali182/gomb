import { describe, expect, it } from 'vitest'
import {
  createPocketLocksDraft,
  isPocketLockSample,
  selectPocketLockSample,
  setPocketLockMembership,
} from '../components/pocket-locks/pocketLocksDraftUtils'
import { pocketLockProperties } from '../schemas/lock'
import { d } from '../testData'
import {
  getOrderedPockets,
  getPocketLockValue,
  getPocketLockValueKey,
  getPocketStitchingLockValue,
} from './pocketLockUtils'

const fixture = () => {
  const a = d.tPocket({ id: 'a', opening: { type: 'slanted', offset: 5, side: 'start' } })
  const b = d.tPocket({ id: 'b', opening: { type: 'slanted', offset: 5, side: 'start' } })
  const c = d.tPocket({ id: 'c', opening: { type: 'straight' } })
  const front = d.frontPocket({ id: 'front' })
  const subProject = d.subProject({
    id: 'sp',
    root: d.rootPanel({ id: 'root', children: ['cluster'] }),
    components: [d.pocketCluster({ id: 'cluster', children: ['a', 'b', 'c', 'front'] }), a, b, c, front],
  })
  return { subProject, a, b, c, front }
}

describe('pocket lock values', () => {
  it('orders pockets by the tree rather than the component record', () => {
    const { subProject } = fixture()
    subProject.components = Object.fromEntries(Object.entries(subProject.components).reverse())
    expect(getOrderedPockets(subProject).map((pocket) => pocket.id)).toEqual(['a', 'b', 'c', 'front'])
  })

  it('compares opening patches and distinguishes opening settings', () => {
    const { subProject, a, b } = fixture()
    expect(getPocketLockValue(a, 'pocket-opening')).toEqual({ opening: a.opening })
    expect(getPocketLockValueKey(subProject, a, 'pocket-opening')).toBe(
      getPocketLockValueKey(subProject, b, 'pocket-opening'),
    )
    expect(getPocketLockValueKey(subProject, a, 'pocket-opening')).not.toBe(
      getPocketLockValueKey(
        subProject,
        { ...a, opening: { type: 'slanted', offset: 5, side: 'end' } },
        'pocket-opening',
      ),
    )
  })

  it('compares only stitching settings, distinguishes inheritance, and preserves list order', () => {
    const { subProject, a, b } = fixture()
    const first = d.tPocketStitchLine({
      id: 'first',
      name: 'First',
      targetId: 'a',
      targetType: 'component',
      startOffset: 1,
    })
    const equivalent = { ...first, id: 'other', name: 'Other', targetId: 'b' }
    subProject.stitchLines = [first, equivalent]
    expect(getPocketLockValueKey(subProject, a, 'pocket-stitching')).toBe(
      getPocketLockValueKey(subProject, b, 'pocket-stitching'),
    )
    expect(getPocketStitchingLockValue(subProject, a)[0]).not.toHaveProperty('id')
    expect(getPocketStitchingLockValue(subProject, a)[0]).not.toHaveProperty('targetId')
    subProject.stitchLines = [first, { ...equivalent, stitchMargin: 5 }]
    expect(getPocketLockValueKey(subProject, a, 'pocket-stitching')).not.toBe(
      getPocketLockValueKey(subProject, b, 'pocket-stitching'),
    )
    const second = { ...first, id: 'second', startOffset: 2 }
    subProject.stitchLines = [first, second, { ...second, id: 'b-second', targetId: 'b' }, equivalent]
    expect(getPocketLockValueKey(subProject, a, 'pocket-stitching')).not.toBe(
      getPocketLockValueKey(subProject, b, 'pocket-stitching'),
    )
  })

  it('supports shape and T-pocket stitching only on T-pockets', () => {
    const { subProject, front } = fixture()
    expect(getPocketLockValue(front, 'pocket-shape')).toEqual({})
    expect(getPocketStitchingLockValue(subProject, front)).toEqual([])
  })
})

describe('pocket lock draft samples', () => {
  it('stores only keys for both pocket properties and stitching', () => {
    const { subProject, a } = fixture()
    const draft = setPocketLockMembership(
      subProject,
      createPocketLocksDraft(subProject),
      ['a', 'b'],
      pocketLockProperties,
      '1',
      true,
    )
    expect(draft.sampleKeys['1']?.['pocket-opening']).toBe(getPocketLockValueKey(subProject, a, 'pocket-opening'))
    expect(draft.sampleKeys['1']?.['pocket-stitching']).toBe(getPocketLockValueKey(subProject, a, 'pocket-stitching'))
    expect(draft).not.toHaveProperty('stitchingSamples')
  })

  it('marks every equal value together regardless of old or new membership', () => {
    const { subProject, a, b, c, front } = fixture()
    subProject.locks.components = { a: { 'pocket-opening': '1' }, b: { 'pocket-opening': '1' } }
    let draft = createPocketLocksDraft(subProject)
    expect(isPocketLockSample(subProject, draft, a, 'pocket-opening', '1')).toBe(true)
    expect(isPocketLockSample(subProject, draft, b, 'pocket-opening', '1')).toBe(true)
    draft = setPocketLockMembership(subProject, draft, ['c'], ['pocket-opening'], '1', true)
    draft = selectPocketLockSample(subProject, draft, c, 'pocket-opening', '1')
    expect(isPocketLockSample(subProject, draft, c, 'pocket-opening', '1')).toBe(true)
    expect(isPocketLockSample(subProject, draft, front, 'pocket-opening', '1')).toBe(true)
    expect(isPocketLockSample(subProject, draft, a, 'pocket-opening', '1')).toBe(false)
    expect(isPocketLockSample(subProject, draft, b, 'pocket-opening', '1')).toBe(false)
    expect(subProject.components.a).toBe(a)
  })

  it('keeps the source while an equal member remains and then chooses the first remaining member', () => {
    const { subProject, a, b, c } = fixture()
    let draft = setPocketLockMembership(
      subProject,
      createPocketLocksDraft(subProject),
      ['a', 'b', 'c'],
      ['pocket-opening'],
      '1',
      true,
    )
    draft = setPocketLockMembership(subProject, draft, ['a'], ['pocket-opening'], '1', false)
    expect(isPocketLockSample(subProject, draft, b, 'pocket-opening', '1')).toBe(true)
    draft = setPocketLockMembership(subProject, draft, ['b'], ['pocket-opening'], '1', false)
    expect(isPocketLockSample(subProject, draft, c, 'pocket-opening', '1')).toBe(true)
    expect(isPocketLockSample(subProject, draft, a, 'pocket-opening', '1')).toBe(false)
  })

  it('bulk assignments skip unsupported categories and keep groups and categories independent', () => {
    const { subProject, a } = fixture()
    let draft = setPocketLockMembership(
      subProject,
      createPocketLocksDraft(subProject),
      ['a', 'b', 'front'],
      pocketLockProperties,
      '1',
      true,
    )
    expect(draft.locks.components.front).toEqual({ 'pocket-contents': '1', 'pocket-opening': '1' })
    draft = setPocketLockMembership(subProject, draft, ['a', 'b'], ['pocket-shape'], '2', true)
    expect(draft.locks.components.a).toEqual({
      'pocket-contents': '1',
      'pocket-shape': '2',
      'pocket-opening': '1',
      'pocket-stitching': '1',
    })
    expect(isPocketLockSample(subProject, draft, a, 'pocket-opening', '1')).toBe(true)
    expect(draft.sampleKeys['2']?.['pocket-shape']).toBeDefined()
  })
})
