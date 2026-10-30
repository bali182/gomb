import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('SubProjectLimitsAccessor', () => {
  it('shares all three limit records between strict and optional lookups', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [d.hole({ id: 'hole', componentId: 'root' })],
      stitchLines: [d.componentBoundsStitchLine({ id: 'line', targetId: 'root', targetType: 'component' })],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    expect(accessor.limits.component('root')).toBe(computed.limits.components.root)
    expect(accessor.limits.hole('hole')).toBe(computed.limits.holes.hole)
    expect(accessor.limits.stitchLine('line')).toBe(computed.limits.stitchLines.line)
    for (const [strict, optional] of [
      [accessor.limits.component, accessor.optional.limits.component],
      [accessor.limits.hole, accessor.optional.limits.hole],
      [accessor.limits.stitchLine, accessor.optional.limits.stitchLine],
    ] as const) {
      expect(optional('missing')).toBeUndefined()
      expect(() => strict('missing')).toThrow('Missing')
    }
    expect(accessor.optional.limits.component('root')).toBe(accessor.limits.component('root'))
    expect(accessor.optional.limits.hole('hole')).toBe(accessor.limits.hole('hole'))
    expect(accessor.optional.limits.stitchLine('line')).toBe(accessor.limits.stitchLine('line'))
  })
})
