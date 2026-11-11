import { describe, expect, it } from 'vitest'
import { d } from '../../../testData'
import {
  createCloneComponentParams,
  getCloneComponentSelection,
  normalizeCloneComponentParams,
} from './cloneComponentSelection'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'outside'] }),
    components: [
      d.panel({ id: 'panel', children: ['child'] }),
      d.panel({ id: 'child', children: ['grandchild'] }),
      d.panel({ id: 'grandchild' }),
      d.panel({ id: 'outside' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'child' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole' })],
    constraints: {
      linked: {
        id: 'linked',
        type: 'equal-constraint',
        fields: [
          { id: 'child-field', type: 'panel-constraint-field', modelId: 'child', field: 'width' },
          { id: 'grandchild-field', type: 'panel-constraint-field', modelId: 'grandchild', field: 'width' },
        ],
      },
    },
  })

const pocketFixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [
      d.panel({ id: 'panel', children: ['cluster'] }),
      d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
      d.tPocket({ id: 't', openingId: 'opening' }),
      d.frontPocket({ id: 'front', openingId: 'opening' }),
    ],
    pocketOpenings: [{ id: 'opening', type: 'slanted', name: 'Opening', offset: 2, side: 'start' }],
    constraints: {
      reference: {
        id: 'reference',
        type: 'equal-constraint',
        fields: [
          { id: 't-field', type: 't-pocket-constraint-field', modelId: 't', field: 'openingId' },
          { id: 'front-field', type: 'front-pocket-constraint-field', modelId: 'front', field: 'openingId' },
        ],
      },
      opening: {
        id: 'opening-constraint',
        type: 'equal-constraint',
        fields: [{ id: 'opening-field', type: 'slanted-constraint-field', modelId: 'opening', field: 'offset' }],
      },
    },
  })

describe('clone component selection', () => {
  it('defaults to cloning all owned models, lists components depth first and locks the source', () => {
    const source = fixture()
    const params = createCloneComponentParams(source, 'panel')
    expect(params.children).toEqual({ child: { action: 'clone' }, grandchild: { action: 'clone' } })
    expect(params.holes).toEqual({ hole: { action: 'clone' } })
    expect(params.stitchLines).toEqual({ stitch: { action: 'clone' } })
    expect(params.constraints).toEqual({ linked: { action: 'ignore' } })
    const selection = getCloneComponentSelection(source, params)
    expect(selection.clonedModelIds).toEqual(new Set(['panel', 'child', 'grandchild', 'hole', 'stitch']))
    expect(selection.components.map((row) => [row.component.id, row.disabled])).toEqual([
      ['panel', true],
      ['child', false],
      ['grandchild', false],
    ])
  })

  it('disables descendants and removes owned records, then restores them with defaults only when their owner is selected', () => {
    const source = fixture()
    let params = createCloneComponentParams(source, 'panel')
    params.holes.hole.action = 'ignore'
    params.constraints.linked.action = 'add-to-existing'
    params.children.child.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.grandchild.action).toBe('ignore')
    expect(params.holes).toEqual({})
    expect(params.stitchLines).toEqual({})
    expect(params.constraints).toEqual({})
    expect(getCloneComponentSelection(source, params).components[2].disabled).toBe(true)
    params.children.child.action = 'clone'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.grandchild.action).toBe('ignore')
    expect(params.holes.hole.action).toBe('clone')
    expect(params.stitchLines.stitch.action).toBe('clone')
    expect(params.constraints.linked.action).toBe('ignore')
  })

  it('restores a stitch line with its default after its hole is deselected and selected', () => {
    const source = fixture()
    let params = createCloneComponentParams(source, 'panel')
    params.stitchLines.stitch.action = 'ignore'
    params.holes.hole.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.stitchLines).toEqual({})
    params.holes.hole.action = 'clone'
    params = normalizeCloneComponentParams(source, params)
    expect(params.stitchLines.stitch.action).toBe('clone')
  })

  it('keeps a constraint with one new field, but resets separate creation to ignore', () => {
    const source = fixture()
    const params = createCloneComponentParams(source, 'panel')
    params.constraints.linked.action = 'constrain-separately'
    params.children.grandchild.action = 'ignore'
    const normalized = normalizeCloneComponentParams(source, params)
    expect(normalized.constraints.linked.action).toBe('ignore')
    expect(getCloneComponentSelection(source, normalized).constraints[0]).toMatchObject({
      canAddToExisting: true,
      canConstrainSeparately: false,
      fields: [{ modelId: 'child' }],
    })
    normalized.constraints.linked.action = 'add-to-existing'
    expect(normalizeCloneComponentParams(source, normalized).constraints.linked.action).toBe('add-to-existing')
  })

  it('requires the front pocket only while its cluster is selected and restores opening defaults', () => {
    const source = pocketFixture()
    let params = createCloneComponentParams(source, 'panel')
    expect(params.pocketOpenings.opening).toEqual({ action: 'keep-original' })
    params.children.front.action = 'ignore'
    params.pocketOpenings.opening = { action: 'clone' }
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.front.action).toBe('clone')
    expect(
      getCloneComponentSelection(source, params).components.find((row) => row.component.id === 'front')?.disabled,
    ).toBe(true)
    params.children.cluster.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.front.action).toBe('ignore')
    expect(params.pocketOpenings).toEqual({})
    params.children.cluster.action = 'clone'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.front.action).toBe('clone')
    expect(params.children.t.action).toBe('ignore')
    expect(params.pocketOpenings.opening).toEqual({ action: 'keep-original' })
  })

  it.each(['clone', 'set-to-default'] as const)(
    'blocks adding opening reference fields when the opening action is %s',
    (action) => {
      const source = pocketFixture()
      const params = createCloneComponentParams(source, 'panel')
      params.pocketOpenings.opening = { action }
      params.constraints.reference.action = 'add-to-existing'
      const normalized = normalizeCloneComponentParams(source, params)
      expect(normalized.constraints.reference.action).toBe('ignore')
      const selection = getCloneComponentSelection(source, normalized)
      expect(selection.clonedModelIds.has('opening')).toBe(action === 'clone')
      expect(selection.constraints.find((row) => row.constraint.id === 'reference')?.canAddToExisting).toBe(false)
      expect(selection.constraints.some((row) => row.constraint.id === 'opening-constraint')).toBe(action === 'clone')
    },
  )

  it('permits adding a reference field when resetting to the already referenced default', () => {
    const source = pocketFixture()
    source.defaultPocketOpening = 'opening'
    const params = createCloneComponentParams(source, 'panel')
    params.pocketOpenings.opening = { action: 'set-to-default' }
    params.constraints.reference.action = 'add-to-existing'
    expect(normalizeCloneComponentParams(source, params).constraints.reference.action).toBe('add-to-existing')
  })

  it('lists constraints on holes and stitch lines only when those models will be cloned', () => {
    const source = fixture()
    source.constraints.owned = {
      id: 'owned',
      type: 'equal-constraint',
      fields: [
        { id: 'hole-width', type: 'hole-constraint-field', modelId: 'hole', field: 'width' },
        {
          id: 'stitch-margin',
          type: 'component-bounds-stitch-line-constraint-field',
          modelId: 'stitch',
          field: 'stitchMargin',
        },
      ],
    }
    let params = createCloneComponentParams(source, 'panel')
    expect(params.constraints.owned.action).toBe('ignore')
    params.holes.hole.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.constraints.owned).toBeUndefined()
  })

  it('leaves a leaf source present and disabled, with no child records', () => {
    const source = fixture()
    const params = createCloneComponentParams(source, 'grandchild')
    expect(params.children).toEqual({})
    expect(getCloneComponentSelection(source, params).components).toEqual([
      { component: source.components.grandchild, disabled: true },
    ])
  })
})
