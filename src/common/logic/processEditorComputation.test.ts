import { describe, expect, it } from 'vitest'

import { defaultStitchingSettings } from '../defaultStates'
import { deleteComponent } from '../operations/subProject/deleteComponent'
import { deletePocketOpening } from '../operations/subProject/deletePocketOpening'
import { flip } from '../operations/subProject/flip'
import { updateHole } from '../operations/subProject/updateHole'
import { updateStitchLine } from '../operations/subProject/updateStitchLine'
import type { ConstraintFieldSchema, EqualConstraintSchema } from '../schemas/constraints'
import type { SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { getComputedSubProject } from './getComputedSubProject'
import { processEditorComputation, processSubProjectComputation } from './processEditorComputation'

const equal = (id: string, fields: ConstraintFieldSchema[]): EqualConstraintSchema => ({
  id,
  type: 'equal-constraint',
  fields,
})
const offsetFixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', width: 100, height: 80 }),
    holes: [d.hole({ id: 'hole', componentId: 'root', width: 20, height: 20 })],
    stitchLines: [
      d.componentBoundsStitchLine({
        id: 'stitch',
        targetId: 'root',
        targetType: 'component',
        top: false,
        topLeftCorner: false,
        topRightCorner: false,
        autoCornerRadius: false,
        topStartOffset: 15,
      }),
    ],
    constraints: {
      linked: equal('linked', [
        { id: 'hole-offset', type: 'hole-constraint-field', modelId: 'hole', field: 'xOffset' },
        {
          id: 'stitch-offset',
          type: 'component-bounds-stitch-line-constraint-field',
          modelId: 'stitch',
          field: 'topStartOffset',
        },
      ]),
    },
  })

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

  it('keeps the manually edited value when a patcher resets that field', () => {
    const source = offsetFixture()
    const previous = updateHole(source, { hole: { ...source.holes[0], xOffset: 15 } })
    const input = updateStitchLine(previous, {
      stitchLine: { ...accessors.subProject(previous).stitchLine.bounds('stitch'), topStartOffset: 25 },
    })
    const project = d.project({ id: 'project', subProjects: [input] })
    const result = processEditorComputation({
      requestId: 3,
      project,
      subProjectId: input.id,
      previousSubProject: previous,
    })
    const subProject = accessors.project(result.project).subProject(input.id)
    expect(accessors.subProject(subProject).hole.byId('hole').xOffset).toBe(25)
    expect(accessors.subProject(subProject).stitchLine.bounds('stitch').topStartOffset).toBe(25)
    expect(result.computedSubProject).toEqual(getComputedSubProject(subProject, project.stitchingSettings))
    expect(accessors.subProject(input).stitchLine.bounds('stitch').topStartOffset).toBe(25)
    expect(accessors.subProject(previous).stitchLine.bounds('stitch').topStartOffset).toBe(15)
  })

  it('propagates a real patcher reset when no linked input field was edited', () => {
    const source = offsetFixture()
    const input = updateHole(source, { hole: { ...source.holes[0], xOffset: 15 } })
    const result = processSubProjectComputation(input, defaultStitchingSettings, input)
    expect(accessors.subProject(result.subProject).hole.byId('hole').xOffset).toBe(0)
    expect(accessors.subProject(result.subProject).stitchLine.bounds('stitch').topStartOffset).toBe(0)
  })

  it('keeps equal saved radii while computing independent local limits', () => {
    const radii = { topLeftRadius: 10, topRightRadius: 60, bottomLeftRadius: 60, bottomRightRadius: 60 }
    const before = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 200, height: 150 }),
      holes: [
        d.hole({
          id: 'large',
          componentId: 'root',
          width: 60,
          height: 60,
          xAnchor: 'start',
          yAnchor: 'start',
          ...radii,
        }),
        d.hole({
          id: 'small',
          componentId: 'root',
          width: 20,
          height: 20,
          xAnchor: 'start',
          yAnchor: 'start',
          xOffset: 100,
          ...radii,
        }),
      ],
      constraints: {
        linked: equal('linked', [
          { id: 'large-radius', type: 'hole-constraint-field', modelId: 'large', field: 'topLeftRadius' },
          { id: 'small-radius', type: 'hole-constraint-field', modelId: 'small', field: 'topLeftRadius' },
        ]),
      },
    })
    const input = updateHole(before, { hole: { ...before.holes[1], topLeftRadius: 60 } })
    const result = processSubProjectComputation(input, defaultStitchingSettings, before)
    expect(result.subProject.holes.map((hole) => hole.topLeftRadius)).toEqual([60, 60])
    expect(result.computedSubProject.holes.large.cornerRadius.topLeft.toNumber()).toBe(30)
    expect(result.computedSubProject.holes.small.cornerRadius.topLeft.toNumber()).toBe(10)
  })

  it('resolves a multi-field mirror from the first post-operation value', () => {
    const before = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 200, height: 150, children: ['a', 'b'] }),
      components: [
        d.panel({
          id: 'a',
          width: 80,
          height: 80,
          autoWidth: false,
          autoHeight: false,
          topLeftRadius: 10,
          topRightRadius: 20,
        }),
        d.panel({
          id: 'b',
          width: 80,
          height: 80,
          autoWidth: false,
          autoHeight: false,
          topLeftRadius: 10,
          topRightRadius: 30,
        }),
      ],
      constraints: {
        linked: equal('linked', [
          { id: 'a-radius', type: 'panel-constraint-field', modelId: 'a', field: 'topLeftRadius' },
          { id: 'b-radius', type: 'panel-constraint-field', modelId: 'b', field: 'topLeftRadius' },
        ]),
      },
    })
    const mirrored = flip(before, accessors.subProject(before).component.rootPanel(), 'horizontal')
    const result = processSubProjectComputation(mirrored, defaultStitchingSettings, before)
    expect(accessors.subProject(result.subProject).component.panel('a').topLeftRadius).toBe(20)
    expect(accessors.subProject(result.subProject).component.panel('b').topLeftRadius).toBe(20)
  })

  it('retains reference cleanup and removes orphaned constraint fields without deleting constraints', () => {
    const before = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel', autoWidth: false, autoHeight: false })],
      stitchLines: ['first', 'second'].map((id) =>
        d.componentBoundsStitchLine({ id, targetId: 'root', targetType: 'component', onTop: 'panel' }),
      ),
      constraints: {
        render: equal('render', [
          {
            id: 'first-target',
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: 'first',
            field: 'onTop',
          },
          {
            id: 'second-target',
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: 'second',
            field: 'onTop',
          },
        ]),
        size: equal('size', [{ id: 'panel-width', type: 'panel-constraint-field', modelId: 'panel', field: 'width' }]),
      },
    })
    const input = deleteComponent(before, { componentId: 'panel' })
    const result = processSubProjectComputation(input, defaultStitchingSettings, before)
    expect(
      result.subProject.stitchLines.map(
        (stitchLine) => accessors.subProject(result.subProject).stitchLine.bounds(stitchLine.id).onTop,
      ),
    ).toEqual([undefined, undefined])
    expect(result.subProject.constraints.size.fields).toEqual([])
    expect(result.subProject.components).not.toHaveProperty('panel')
  })

  it('keeps linked pockets on the replacement opening after an opening is deleted', () => {
    const before = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['a', 'b'] }),
        d.tPocket({ id: 'a', openingId: 'removed' }),
        d.tPocket({ id: 'b', openingId: 'removed' }),
      ],
      constraints: {
        linked: equal('linked', [
          { id: 'a-opening', type: 't-pocket-constraint-field', modelId: 'a', field: 'openingId' },
          { id: 'b-opening', type: 't-pocket-constraint-field', modelId: 'b', field: 'openingId' },
        ]),
      },
    })
    const input = deletePocketOpening(before, { openingId: 'removed' })
    const result = processSubProjectComputation(input, defaultStitchingSettings, before)
    expect(accessors.subProject(result.subProject).component.tPocket('a').openingId).toBe(before.defaultPocketOpening)
    expect(accessors.subProject(result.subProject).component.tPocket('b').openingId).toBe(before.defaultPocketOpening)
    expect(result.subProject.pocketOpenings).not.toHaveProperty('removed')
  })
})
