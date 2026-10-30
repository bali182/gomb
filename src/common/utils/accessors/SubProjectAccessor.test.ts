import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

describe('SubProjectAccessor', () => {
  it('exposes matching strict and optional objects without changing the source model', () => {
    const stitchLine = d.componentBoundsStitchLine({ id: 'line', targetType: 'component', targetId: 'root' })
    const hole = d.hole({ id: 'hole', componentId: 'root' })
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [hole],
      stitchLines: [stitchLine],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)
    expect(accessor.component.byId('root')).toBe(accessor.optional.component.byId('root'))
    expect(accessor.hole.byId('hole')).toBe(accessor.optional.hole.byId('hole'))
    expect(accessor.stitchLine.byId('line')).toBe(accessor.optional.stitchLine.byId('line'))
    expect(accessor.stitchLine.byOwner('root')).toBe(accessor.optional.stitchLine.byOwner('root'))
    expect(accessor.stitchLine.byOnTop('root')).toBe(accessor.optional.stitchLine.byOnTop('root'))
    expect(subProject).toEqual(snapshot)
  })
})
