import { describe, expect, it } from 'vitest'
import { updateComponent } from '../operations/subProject/updateComponent'
import type { EqualConstraintSchema } from '../schemas/constraints'
import { d } from '../testData'
import { accessors } from './accessors'
import { getSubProjectDiff } from './getSubProjectDiff'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel', width: 10 })],
    holes: [d.hole({ id: 'first', componentId: 'panel' }), d.hole({ id: 'second', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'panel', targetType: 'component' })],
    constraints: { equal: { id: 'equal', type: 'equal-constraint', fields: [] } },
  })

describe('getSubProjectDiff', () => {
  it('omits equivalent models even when their identities or array positions differ', () => {
    const before = fixture()
    const after = {
      ...before,
      components: { ...before.components, panel: { ...before.components.panel } },
      holes: [...before.holes].reverse(),
    }
    const diff = getSubProjectDiff(before, after)
    expect(diff).toEqual({
      root: undefined,
      defaultPocketOpening: undefined,
      components: {},
      holes: {},
      stitchLines: {},
      pocketOpenings: {},
      constraints: {},
    })
  })

  it('records changed models by id and retains the actual snapshots without mutation', () => {
    const before = fixture()
    const snapshot = structuredClone(before)
    const panel = { ...accessors.subProject(before).component.panel('panel'), width: 25 }
    const after = updateComponent(before, { component: panel })
    const diff = getSubProjectDiff(before, after)
    expect(Object.keys(diff.components)).toEqual(['panel'])
    expect(diff.components.panel.before).toBe(before.components.panel)
    expect(diff.components.panel.after).toBe(panel)
    expect(before).toEqual(snapshot)
  })

  it('distinguishes additions, deletions and changes in array-backed collections', () => {
    const before = fixture()
    const changed = { ...before.holes[1], width: 35 }
    const added = d.hole({ id: 'third', componentId: 'panel' })
    const after = { ...before, holes: [added, changed], stitchLines: [] }
    const diff = getSubProjectDiff(before, after)
    expect(diff.holes).toEqual({
      first: { before: before.holes[0], after: undefined },
      second: { before: before.holes[1], after: changed },
      third: { before: undefined, after: added },
    })
    expect(diff.stitchLines.stitch).toEqual({ before: before.stitchLines[0], after: undefined })
  })

  it('includes constraint membership and subproject reference changes', () => {
    const before = fixture()
    const added: EqualConstraintSchema = { id: 'other', type: 'equal-constraint', fields: [] }
    const after = { ...before, root: 'panel', defaultPocketOpening: 'other-opening', constraints: { other: added } }
    const diff = getSubProjectDiff(before, after)
    expect(diff.root).toEqual({ before: 'root', after: 'panel' })
    expect(diff.defaultPocketOpening).toEqual({ before: before.defaultPocketOpening, after: 'other-opening' })
    expect(diff.constraints.equal).toEqual({ before: before.constraints.equal, after: undefined })
    expect(diff.constraints.other).toEqual({ before: undefined, after: added })
  })

  it('represents loading without a previous subproject as additions', () => {
    const input = fixture()
    const diff = getSubProjectDiff(undefined, input)
    expect(diff.components.panel).toEqual({ before: undefined, after: input.components.panel })
    expect(diff.constraints.equal).toEqual({ before: undefined, after: input.constraints.equal })
  })
})
