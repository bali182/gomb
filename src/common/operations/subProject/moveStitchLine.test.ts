import { describe, expect, it } from 'vitest'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { moveStitchLine } from './moveStitchLine'
import { createBaseOperationParams } from './testUtils'

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

describe('moveStitchLine', () => {
  it('rejects moving stitching to a cluster without a front and permits a compatible populated cluster', () => {
    const fixtureSource = fixture()
    const empty = d.pocketCluster({ id: 'empty' })
    const withoutFront = d.pocketCluster({ id: 'without-front', children: ['a'] })
    const source: SubProjectSchema = {
      ...fixtureSource,
      components: { ...fixtureSource.components, empty, 'without-front': withoutFront },
      stitchLines: [d.componentBoundsStitchLine({ id: 'line', targetId: 'root', targetType: 'component' })],
    }
    const snapshot = structuredClone(source)
    for (const targetId of ['empty', 'without-front', 'a']) {
      expect(moveStitchLine(createBaseOperationParams(source), { id: 'line', targetId, targetType: 'component' })).toBe(
        source,
      )
    }
    for (const targetId of ['first', 'front-a']) {
      const moved = moveStitchLine(createBaseOperationParams(source), { id: 'line', targetId, targetType: 'component' })
      expect(moved.stitchLines[0]).toEqual({ ...source.stitchLines[0], targetId })
      expect(moved.components).toBe(source.components)
    }
    expect(source).toEqual(snapshot)
  })

  it('moves pocket stitching between compatible owners', () => {
    const source = {
      ...fixture(),
      stitchLines: [d.tPocketStitchLine({ id: 'line', targetId: 'a', targetType: 'component' })],
    }
    const snapshot = structuredClone(source)
    const moved = moveStitchLine(createBaseOperationParams(source), {
      id: 'line',
      targetId: 'first',
      targetType: 'component',
    })
    expect(moved.stitchLines[0].targetId).toBe('first')
    const returned = moveStitchLine(createBaseOperationParams(moved), {
      id: 'line',
      targetId: 'b',
      targetType: 'component',
    })
    expect(returned.stitchLines[0].targetId).toBe('b')
    for (const targetId of ['front-a', 'root', 'child']) {
      expect(moveStitchLine(createBaseOperationParams(moved), { id: 'line', targetId, targetType: 'component' })).toBe(
        moved,
      )
    }
    expect(source).toEqual(snapshot)
  })
})
