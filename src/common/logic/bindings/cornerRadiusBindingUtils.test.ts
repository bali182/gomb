import { describe, expect, it } from 'vitest'
import type { BindingSchema } from '../../schemas/bindings'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { CORNER_RADIUS_FIELD_ORDER, getCornerRadiusBindingState } from './cornerRadiusBindingUtils'

const fixture = (bindings: Record<string, BindingSchema> = {}): SubProjectSchema =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [d.panel({ id: 'panel' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'panel', targetType: 'component' })],
    bindings,
  })

const pair = (id: string, fields: readonly (keyof HasCornerRadiusSchema)[]): BindingSchema => ({
  id,
  type: 'equal-binding',
  fields: fields.map((field) => ({ id: `${id}-${field}`, type: 'panel-binding-field', modelId: 'panel', field })),
})

describe('getCornerRadiusBindingState', () => {
  it('starts without a binding and with all panel corners available', () => {
    expect(getCornerRadiusBindingState(fixture(), 'panel')).toEqual({
      binding: undefined,
      disabledFields: [],
      hasMultipleBindings: false,
    })
  })

  it('recognizes a diagonal pair as one internal binding', () => {
    const binding = pair('diagonal', ['topLeftRadius', 'bottomRightRadius'])
    expect(getCornerRadiusBindingState(fixture({ diagonal: binding }), 'panel')).toEqual({
      binding,
      disabledFields: [],
      hasMultipleBindings: false,
    })
  })

  it('blocks the popover when corners belong to two separate internal bindings', () => {
    const source = fixture({
      top: pair('top', ['topLeftRadius', 'topRightRadius']),
      bottom: pair('bottom', ['bottomLeftRadius', 'bottomRightRadius']),
    })
    expect(getCornerRadiusBindingState(source, 'panel')).toEqual({
      binding: undefined,
      disabledFields: [],
      hasMultipleBindings: true,
    })
  })

  it('disables corners bound to a different model or a non-radius field of the same model', () => {
    const otherModel = pair('other-model', ['topLeftRadius'])
    otherModel.fields.push({
      id: 'hole-radius',
      type: 'hole-binding-field',
      modelId: 'hole',
      field: 'topLeftRadius',
    })
    const otherField = pair('other-field', ['topRightRadius'])
    otherField.fields.push({ id: 'width', type: 'panel-binding-field', modelId: 'panel', field: 'width' })
    const internal = pair('internal', ['bottomLeftRadius', 'bottomRightRadius'])
    expect(
      getCornerRadiusBindingState(fixture({ 'other-model': otherModel, 'other-field': otherField, internal }), 'panel'),
    ).toEqual({
      binding: internal,
      disabledFields: ['topLeftRadius', 'topRightRadius'],
      hasMultipleBindings: false,
    })
  })

  it('ignores bindings unrelated to corner radii', () => {
    const width: BindingSchema = {
      id: 'width',
      type: 'equal-binding',
      fields: [{ id: 'width-field', type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    }
    expect(getCornerRadiusBindingState(fixture({ width }), 'panel')?.disabledFields).toEqual([])
  })

  it('disables automatic stitch-line radii without disabling the popover', () => {
    expect(getCornerRadiusBindingState(fixture(), 'stitch')).toEqual({
      binding: undefined,
      disabledFields: CORNER_RADIUS_FIELD_ORDER,
      hasMultipleBindings: false,
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
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.pocketCluster({ id: 'cluster', orientation, children: ['front'] }),
        d.frontPocket({ id: 'front' }),
      ],
    })
    expect(getCornerRadiusBindingState(source, 'cluster')?.disabledFields).toEqual(expected[orientation])
    expect(getCornerRadiusBindingState(source, 'front')?.disabledFields).toEqual(expected[orientation])
  })

  it('returns no state for a missing model or a model without corner radii', () => {
    const source = fixture()
    expect(getCornerRadiusBindingState(source, 'missing')).toBeUndefined()
    const unsupported = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['pocket'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.tPocket({ id: 'pocket' })],
    })
    expect(getCornerRadiusBindingState(unsupported, 'pocket')).toBeUndefined()
  })
})
