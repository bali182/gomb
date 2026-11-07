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
import { processSubProjectComputation } from './processSubProjectComputation'

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
        startOffset: 15,
      }),
    ],
    constraints: {
      linked: equal('linked', [
        { id: 'hole-offset', type: 'hole-constraint-field', modelId: 'hole', field: 'xOffset' },
        {
          id: 'stitch-offset',
          type: 'component-bounds-stitch-line-constraint-field',
          modelId: 'stitch',
          field: 'startOffset',
        },
      ]),
    },
  })

describe('processSubProjectComputation', () => {
  it('patches the supplied subproject and returns matching geometry without mutating the input', () => {
    const selected = d.subProject({
      id: 'selected',
      root: d.rootPanel({ id: 'root', width: 130, height: 80, children: ['panel'] }),
      components: [d.panel({ id: 'panel', width: 100, height: 50, autoWidth: true, autoHeight: true })],
    })
    const before = structuredClone(selected)
    const result = processSubProjectComputation(selected, defaultStitchingSettings)
    const patched = result.subProject

    expect(patched.id).toBe(selected.id)
    expect(accessors.subProject(patched).component.panel('panel')).toMatchObject({ width: 130, height: 80 })
    expect(result.computedSubProject).toEqual(getComputedSubProject(patched, defaultStitchingSettings))
    expect(selected).toEqual(before)
  })

  it('computes the subproject with the supplied common stitching settings', () => {
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
    const stitchingSettings = { ...defaultStitchingSettings, stitchMargin: 8 }
    const result = processSubProjectComputation(selected, stitchingSettings)
    const patched = result.subProject
    const stitchLine = accessors.subProject(patched).stitchLine.bounds('stitch')
    const computed = accessors.computedSubProject(result.computedSubProject).stitchLine.byId('stitch')

    expect(stitchLine.topLeftRadius).toBe(computed.autoComputedCornerRadius.topLeft.toNumber())
    expect(result.computedSubProject).toEqual(getComputedSubProject(patched, stitchingSettings))
    expect(result.computedSubProject).not.toEqual(getComputedSubProject(patched, defaultStitchingSettings))
  })

  it('rejects a subproject whose root component does not exist', () => {
    const subProject = { ...d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) }), root: 'missing' }
    expect(() => processSubProjectComputation(subProject, defaultStitchingSettings)).toThrow()
  })

  it('keeps the manually edited value when a patcher resets that field', () => {
    const source = offsetFixture()
    const previous = updateHole(source, { hole: { ...source.holes[0], xOffset: 15 } })
    const input = updateStitchLine(previous, {
      stitchLine: { ...accessors.subProject(previous).stitchLine.bounds('stitch'), startOffset: 25 },
    })
    const result = processSubProjectComputation(input, defaultStitchingSettings, previous)
    const subProject = result.subProject
    expect(accessors.subProject(subProject).hole.byId('hole').xOffset).toBe(25)
    expect(accessors.subProject(subProject).stitchLine.bounds('stitch').startOffset).toBe(25)
    expect(result.computedSubProject).toEqual(getComputedSubProject(subProject, defaultStitchingSettings))
    expect(accessors.subProject(input).stitchLine.bounds('stitch').startOffset).toBe(25)
    expect(accessors.subProject(previous).stitchLine.bounds('stitch').startOffset).toBe(15)
  })

  it('preserves offsets when their endpoint is temporarily inactive', () => {
    const source = offsetFixture()
    const input = updateHole(source, { hole: { ...source.holes[0], xOffset: 15 } })
    const result = processSubProjectComputation(input, defaultStitchingSettings, input)
    expect(accessors.subProject(result.subProject).hole.byId('hole').xOffset).toBe(15)
    expect(accessors.subProject(result.subProject).stitchLine.bounds('stitch').startOffset).toBe(15)
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

describe('obsolete stitch constraint fields', () => {
  it.each([
    'topStartOffset',
    'top',
    'right',
    'bottom',
    'left',
    'topLeftCorner',
    'topRightCorner',
    'bottomRightCorner',
    'bottomLeftCorner',
  ])('ignores obsolete %s before resolving constraints and removes it afterward', (field) => {
    const source = offsetFixture()
    const obsolete = {
      id: 'old',
      type: 'component-bounds-stitch-line-constraint-field',
      modelId: 'stitch',
      field,
    } as unknown as ConstraintFieldSchema
    source.constraints.linked = {
      ...source.constraints.linked,
      fields: [obsolete, source.constraints.linked.fields[0]],
    }
    const result = processSubProjectComputation(source, defaultStitchingSettings)
    expect(result.subProject.constraints.linked.fields).toEqual([source.constraints.linked.fields[1]])
  })
})
