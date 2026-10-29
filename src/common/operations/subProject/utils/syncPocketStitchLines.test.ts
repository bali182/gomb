import { describe, expect, it } from 'vitest'
import { getPocketStitchingLockValue } from '../../../logic/pocketLockUtils'
import { d } from '../../../testData'
import { accessors } from '../../../utils/accessors'
import { syncPocketStitchLines } from './syncPocketStitchLines'

const fixture = () => {
  const pocket = d.tPocket({ id: 'pocket' })
  const source = d.subProject({
    id: 'sp',
    root: d.rootPanel({ id: 'root', children: ['cluster'] }),
    components: [
      d.pocketCluster({ id: 'cluster', children: ['pocket', 'front'] }),
      pocket,
      d.frontPocket({ id: 'front' }),
    ],
    stitchLines: [
      d.tPocketStitchLine({
        id: 'one',
        name: 'First',
        targetId: 'pocket',
        targetType: 'component',
        startOffset: 1,
        stitchMargin: 8,
      }),
      d.componentBoundsStitchLine({ id: 'outside', targetId: 'root', targetType: 'component' }),
      d.tPocketStitchLine({ id: 'two', name: 'Second', targetId: 'pocket', targetType: 'component', startOffset: 2 }),
    ],
  })
  return source
}

describe('syncPocketStitchLines', () => {
  it('pairs by original array order, preserves local identities, and removes obsolete overrides', () => {
    const source = fixture()
    const settings = getPocketStitchingLockValue(source, accessors.subProject(source).pocket('pocket'))
    delete settings[0].stitchMargin
    settings[0].startOffset = 20
    settings[1].startOffset = 10
    const snapshot = structuredClone(source)
    const result = syncPocketStitchLines(source, 'pocket', settings)
    expect(result.stitchLines.map((line) => line.id)).toEqual(['one', 'outside', 'two'])
    expect(accessors.subProject(result).tPocketStitchLines('pocket')).toMatchObject([
      { id: 'one', name: 'First', targetId: 'pocket', startOffset: 20 },
      { id: 'two', name: 'Second', targetId: 'pocket', startOffset: 10 },
    ])
    expect(result.stitchLines[0]).not.toHaveProperty('stitchMargin')
    expect(result.stitchLines[1]).toBe(source.stitchLines[1])
    expect(source).toEqual(snapshot)
  })

  it('adds independently identified lines and deletes excess lines', () => {
    const source = fixture()
    const settings = getPocketStitchingLockValue(source, accessors.subProject(source).pocket('pocket'))
    const result = syncPocketStitchLines(source, 'pocket', [...settings, { ...settings[0], startOffset: 30 }])
    const lines = accessors.subProject(result).tPocketStitchLines('pocket')
    expect(lines).toHaveLength(3)
    expect(new Set(result.stitchLines.map((line) => line.id)).size).toBe(result.stitchLines.length)
    expect(new Set(result.stitchLines.map((line) => line.name)).size).toBe(result.stitchLines.length)
    expect(lines[2]).toMatchObject({ targetType: 'component', targetId: 'pocket', startOffset: 30 })
    const shortened = syncPocketStitchLines(result, 'pocket', [settings[0]])
    expect(
      accessors
        .subProject(shortened)
        .tPocketStitchLines('pocket')
        .map((line) => line.id),
    ).toEqual(['one'])
  })

  it('clears the complete list without touching unrelated stitching', () => {
    const source = fixture()
    const result = syncPocketStitchLines(source, 'pocket', [])
    expect(result.stitchLines).toEqual([source.stitchLines[1]])
    expect(syncPocketStitchLines(result, 'pocket', [])).toEqual(result)
  })
})
