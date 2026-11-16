import { describe, expect, it } from 'vitest'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { BindingSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { CORNER_RADIUS_FIELD_ORDER, getCornerRadiusConstraintState } from './cornerRadiusConstraintUtils'

const fixture = (constraints: Record<string, BindingSchema> = {}): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'panel', targetType: 'component' })],
    constraints,
  })

const pair = (id: string, fields: readonly (keyof HasCornerRadiusSchema)[]): BindingSchema => ({
  id,
  type: 'equal-constraint',
  fields: fields.map((field) => ({ id: `${id}-${field}`, type: 'panel-constraint-field', modelId: 'panel', field })),
})

describe('getCornerRadiusConstraintState', () => {
  it('starts without a binding and with all panel corners available', () => {
    expect(getCornerRadiusConstraintState(fixture(), 'panel')).toEqual({
      constraint: undefined,
      disabledFields: [],
      hasMultipleConstraints: false,
    })
  })

  it('recognizes a diagonal pair as one internal binding', () => {
    const constraint = pair('diagonal', ['topLeftRadius', 'bottomRightRadius'])
    expect(getCornerRadiusConstraintState(fixture({ diagonal: constraint }), 'panel')).toEqual({
      constraint,
      disabledFields: [],
      hasMultipleConstraints: false,
    })
  })

  it('blocks the popover when corners belong to two separate internal bindings', () => {
    const source = fixture({
      top: pair('top', ['topLeftRadius', 'topRightRadius']),
      bottom: pair('bottom', ['bottomLeftRadius', 'bottomRightRadius']),
    })
    expect(getCornerRadiusConstraintState(source, 'panel')).toEqual({
      constraint: undefined,
      disabledFields: [],
      hasMultipleConstraints: true,
    })
  })

  it('disables corners bound to a different model or a non-radius field of the same model', () => {
    const otherModel = pair('other-model', ['topLeftRadius'])
    otherModel.fields.push({
      id: 'hole-radius',
      type: 'hole-constraint-field',
      modelId: 'hole',
      field: 'topLeftRadius',
    })
    const otherField = pair('other-field', ['topRightRadius'])
    otherField.fields.push({ id: 'width', type: 'panel-constraint-field', modelId: 'panel', field: 'width' })
    const internal = pair('internal', ['bottomLeftRadius', 'bottomRightRadius'])
    expect(
      getCornerRadiusConstraintState(
        fixture({ 'other-model': otherModel, 'other-field': otherField, internal }),
        'panel',
      ),
    ).toEqual({
      constraint: internal,
      disabledFields: ['topLeftRadius', 'topRightRadius'],
      hasMultipleConstraints: false,
    })
  })

  it('ignores constraints unrelated to corner radii', () => {
    const width: BindingSchema = {
      id: 'width',
      type: 'equal-constraint',
      fields: [{ id: 'width-field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
    }
    expect(getCornerRadiusConstraintState(fixture({ width }), 'panel')?.disabledFields).toEqual([])
  })

  it('disables automatic stitch-line radii without disabling the popover', () => {
    expect(getCornerRadiusConstraintState(fixture(), 'stitch')).toEqual({
      constraint: undefined,
      disabledFields: CORNER_RADIUS_FIELD_ORDER,
      hasMultipleConstraints: false,
    })
  })

  const orientations: PocketOrientationSchema[] = ['up', 'down', 'left', 'right']
  const expected: Record<PocketOrientationSchema, readonly (keyof HasCornerRadiusSchema)[]> = {
    up: ['topLeftRadius', 'topRightRadius'],
    down: ['bottomLeftRadius', 'bottomRightRadius'],
    left: ['topLeftRadius', 'bottomLeftRadius'],
    right: ['topRightRadius', 'bottomRightRadius'],
  }
  it.each(orientations)('disables opening-side corners for a cluster and its front pocket facing %s', (orientation) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', orientation, children: ['front'] }),
        d.frontPocket({ id: 'front' }),
      ],
    })
    expect(getCornerRadiusConstraintState(source, 'cluster')?.disabledFields).toEqual(expected[orientation])
    expect(getCornerRadiusConstraintState(source, 'front')?.disabledFields).toEqual(expected[orientation])
  })

  it('returns no state for a missing model or a model without corner radii', () => {
    const source = fixture()
    expect(getCornerRadiusConstraintState(source, 'missing')).toBeUndefined()
    const unsupported = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['pocket'] }),
      components: [d.tPocket({ id: 'pocket' })],
    })
    expect(getCornerRadiusConstraintState(unsupported, 'pocket')).toBeUndefined()
  })
})
