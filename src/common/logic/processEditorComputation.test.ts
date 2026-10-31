import { describe, expect, it } from 'vitest'

import { defaultStitchingSettings } from '../defaultStates'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { getComputedSubProject } from './getComputedSubProject'
import { processEditorComputation } from './processEditorComputation'

describe('processEditorComputation', () => {
  it('patches only the selected subproject and returns matching geometry without mutating the input', () => {
    const selected = d.subProject({
      id: 'selected',
      root: d.rootPanel({ id: 'root', width: 130, height: 80, children: ['panel'] }),
      components: [d.panel({ id: 'panel', width: 100, height: 50, autoWidth: true, autoHeight: true })],
    })
    const other = d.subProject({
      id: 'other',
      root: d.rootPanel({ id: 'other-root', width: 150, children: ['other-panel'] }),
      components: [d.panel({ id: 'other-panel', width: 10, autoWidth: true })],
    })
    const project = d.project({ id: 'project', subProjects: [selected, other] })
    const before = structuredClone(project)
    const result = processEditorComputation({ requestId: 7, project, subProjectId: selected.id })
    const patched = accessors.project(result.project).subProject(selected.id)

    expect(result.requestId).toBe(7)
    expect(accessors.subProject(patched).component.panel('panel')).toMatchObject({ width: 130, height: 80 })
    expect(result.computedSubProject).toEqual(getComputedSubProject(patched, project.stitchingSettings))
    expect(accessors.project(result.project).subProject(other.id)).toBe(other)
    expect(project).toEqual(before)
  })

  it('recomputes the selected subproject with changed project stitching settings', () => {
    const selected = d.subProject({
      id: 'selected',
      root: d.rootPanel({ id: 'root', width: 120, height: 80, topLeftRadius: 20 }),
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'stitch',
          targetId: 'root',
          targetType: 'component',
          autoCornerRadius: true,
        }),
      ],
    })
    const project = d.project({
      id: 'project',
      subProjects: [selected],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 8 },
    })
    const result = processEditorComputation({ requestId: 2, project, subProjectId: selected.id })
    const patched = accessors.project(result.project).subProject(selected.id)
    const stitchLine = accessors.subProject(patched).stitchLine.bounds('stitch')
    const computed = accessors.computedSubProject(result.computedSubProject).stitchLine.byId('stitch')

    expect(stitchLine.topLeftRadius).toBe(computed.autoComputedCornerRadius.topLeft.toNumber())
    expect(result.computedSubProject).toEqual(getComputedSubProject(patched, project.stitchingSettings))
  })

  it('rejects a request for a nonexistent subproject', () => {
    const project = d.project({ id: 'project', subProjects: [] })
    expect(() => processEditorComputation({ requestId: 1, project, subProjectId: 'missing' })).toThrow()
  })
})
