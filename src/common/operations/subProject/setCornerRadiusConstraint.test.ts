import { describe, expect, it } from 'vitest'
import { applyResolution } from '../../logic/constraints/applyResolution'
import { CORNER_RADIUS_FIELD_ORDER } from '../../logic/constraints/cornerRadiusConstraintUtils'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectDiff } from '../../utils/getSubProjectDiff'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { setCornerRadiusConstraint } from './setCornerRadiusConstraint'
import { createBaseOperationParams } from './testUtils'

const fixture = (constraints: Record<string, ConstraintSchema> = {}): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [
      d.panel({ id: 'panel', topLeftRadius: 10, topRightRadius: 20, bottomLeftRadius: 30, bottomRightRadius: 40 }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({
        id: 'stitch',
        targetType: 'component',
        targetId: 'panel',
        autoCornerRadius: false,
      }),
    ],
    constraints,
  })

const pair = (id: string, fields: readonly (keyof HasCornerRadiusSchema)[]): ConstraintSchema => ({
  id,
  type: 'equal-constraint',
  fields: fields.map((field) => ({ id: `${id}-${field}`, type: 'panel-constraint-field', modelId: 'panel', field })),
})

describe('setCornerRadiusConstraint', () => {
  it('creates a diagonal binding in canonical order with unique ids and no input mutation', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const sourceIds = getSubProjectIds(source)
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomRightRadius', 'topLeftRadius'],
    })
    const constraints = Object.values(result.constraints)
    expect(constraints).toHaveLength(1)
    const constraint = constraints[0]
    expect(constraint.fields.map((field) => field.field)).toEqual(['topLeftRadius', 'bottomRightRadius'])
    expect(
      constraint.fields.every((field) => field.modelId === 'panel' && field.type === 'panel-constraint-field'),
    ).toBe(true)
    const ids = [constraint.id, ...constraint.fields.map((field) => field.id)]
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => !sourceIds.has(id))).toBe(true)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('changes the existing binding while retaining its id and surviving field ids', () => {
    const existing = pair('radius', ['topLeftRadius', 'topRightRadius'])
    const unrelated: ConstraintSchema = {
      id: 'width',
      type: 'equal-constraint',
      fields: [{ id: 'root-width', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' }],
    }
    const source = fixture({ radius: existing, width: unrelated })
    const snapshot = structuredClone(source)
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomRightRadius', 'topLeftRadius', 'bottomLeftRadius'],
    })
    expect(Object.keys(result.constraints)).toEqual(['radius', 'width'])
    expect(result.constraints.radius.fields.map((field) => field.field)).toEqual([
      'topLeftRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ])
    expect(result.constraints.radius.fields[0]).toBe(existing.fields[0])
    expect(result.constraints.width).toBe(unrelated)
    expect(source).toEqual(snapshot)
  })

  it('orders all four corners canonically and deduplicates the selection', () => {
    const source = fixture()
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomRightRadius', 'bottomLeftRadius', 'topRightRadius', 'topLeftRadius', 'topLeftRadius'],
    })
    expect(Object.values(result.constraints)[0].fields.map((field) => field.field)).toEqual(CORNER_RADIUS_FIELD_ORDER)
  })

  const emptySelections: (readonly (keyof HasCornerRadiusSchema)[])[] = [[], ['topLeftRadius']]
  it.each(emptySelections)('deletes the internal binding for selection %j', (...fields) => {
    const source = fixture({ radius: pair('radius', CORNER_RADIUS_FIELD_ORDER) })
    const snapshot = structuredClone(source)
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), { modelId: 'panel', fields })
    expect(result.constraints).toEqual({})
    expect(source).toEqual(snapshot)
  })

  it('returns the original reference for an unchanged binding or fewer than two unbound corners', () => {
    const source = fixture({ radius: pair('radius', ['topLeftRadius', 'bottomRightRadius']) })
    expect(
      setCornerRadiusConstraint(createBaseOperationParams(source), {
        modelId: 'panel',
        fields: ['bottomRightRadius', 'topLeftRadius'],
      }),
    ).toBe(source)
    const unbound = fixture()
    for (const fields of emptySelections) {
      expect(setCornerRadiusConstraint(createBaseOperationParams(unbound), { modelId: 'panel', fields })).toBe(unbound)
    }
  })

  it('preserves an external binding while creating and deleting an independent internal binding', () => {
    const external = pair('external', ['topLeftRadius'])
    external.fields.push({ id: 'hole-radius', type: 'hole-constraint-field', modelId: 'hole', field: 'topLeftRadius' })
    const source = fixture({ external })
    const added = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomLeftRadius', 'bottomRightRadius'],
    })
    expect(Object.values(added.constraints)).toHaveLength(2)
    expect(added.constraints.external).toBe(external)
    const removed = setCornerRadiusConstraint(createBaseOperationParams(added), { modelId: 'panel', fields: [] })
    expect(removed.constraints).toEqual({ external })
    expect(removed.constraints.external).toBe(external)
    expect(
      setCornerRadiusConstraint(createBaseOperationParams(source), {
        modelId: 'panel',
        fields: ['topLeftRadius', 'topRightRadius'],
      }),
    ).toBe(source)
  })

  it('rejects any change when two separate internal bindings exist', () => {
    const source = fixture({
      top: pair('top', ['topLeftRadius', 'topRightRadius']),
      bottom: pair('bottom', ['bottomLeftRadius', 'bottomRightRadius']),
    })
    for (const fields of [[], CORNER_RADIUS_FIELD_ORDER]) {
      expect(setCornerRadiusConstraint(createBaseOperationParams(source), { modelId: 'panel', fields })).toBe(source)
    }
  })

  it('rejects automatic radii and corners disabled by the opening orientation', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [d.pocketCluster({ id: 'cluster', orientation: 'up' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'stitch',
          targetType: 'component',
          targetId: 'root',
          autoCornerRadius: true,
        }),
      ],
    })
    for (const modelId of ['cluster', 'stitch']) {
      expect(
        setCornerRadiusConstraint(createBaseOperationParams(source), {
          modelId,
          fields: ['topLeftRadius', 'topRightRadius'],
        }),
      ).toBe(source)
    }
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'cluster',
      fields: ['bottomLeftRadius', 'bottomRightRadius'],
    })
    expect(Object.values(result.constraints)[0].fields.map((field) => field.type)).toEqual([
      'pocket-cluster-constraint-field',
      'pocket-cluster-constraint-field',
    ])
  })

  it.each(['root', 'hole', 'stitch'])('supports corner bindings on %s', (modelId) => {
    const source = fixture()
    const result = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId,
      fields: ['topLeftRadius', 'topRightRadius'],
    })
    expect(Object.values(result.constraints)[0].fields.every((field) => field.modelId === modelId)).toBe(true)
  })

  it('leaves value propagation to the resolver, including edits to a non-first field', () => {
    const source = fixture()
    const updated = setCornerRadiusConstraint(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomRightRadius', 'topLeftRadius'],
    })
    const resolved = applyResolution({ input: source, target: updated, inputDiff: getSubProjectDiff(source, updated) })
    expect(accessors.subProject(resolved).component.panel('panel').bottomRightRadius).toBe(10)
    const panel = accessors.subProject(resolved).component.panel('panel')
    const edited: SubProjectSchema = {
      ...resolved,
      components: { ...resolved.components, panel: { ...panel, bottomRightRadius: 25 } },
    }
    const propagated = applyResolution({
      input: resolved,
      target: edited,
      inputDiff: getSubProjectDiff(resolved, edited),
    })
    expect(accessors.subProject(propagated).component.panel('panel').topLeftRadius).toBe(25)
  })

  it('returns the original reference for a missing model', () => {
    const source = fixture()
    expect(
      setCornerRadiusConstraint(createBaseOperationParams(source), {
        modelId: 'missing',
        fields: ['topLeftRadius', 'topRightRadius'],
      }),
    ).toBe(source)
  })
})
