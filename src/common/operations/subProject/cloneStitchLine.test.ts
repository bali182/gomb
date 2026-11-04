import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { cloneStitchLine } from './cloneStitchLine'
import { getUnusedName } from './utils/getUnusedName'

describe('cloneStitchLine', () => {
  it.each(['component', 'hole'] as const)('retains %s targets and onTop references', (targetType) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel' })],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'stitch',
          targetId: targetType === 'component' ? 'panel' : 'hole',
          targetType,
          onTop: 'root',
          name: 'Stitch',
        }),
      ],
    })
    const snapshot = structuredClone(source)
    const result = cloneStitchLine(source, { stitchLineId: 'stitch', idGenerator: new IdGenerator(), getUnusedName })
    expect(result.stitchLines).toHaveLength(2)
    expect(result.stitchLines[0]).toBe(source.stitchLines[0])
    expect(result.stitchLines[1]).toEqual({
      ...source.stitchLines[0],
      id: expect.stringMatching(/^stitch-line-/),
      name: 'Stitch 1',
    })
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(source).toEqual(snapshot)
  })
  it('retains the source for an unknown stitch line', () => {
    const source = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    expect(cloneStitchLine(source, { stitchLineId: 'missing', idGenerator: new IdGenerator(), getUnusedName })).toBe(
      source,
    )
  })
})
