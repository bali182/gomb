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
    bindings: {
      linked: {
        id: 'linked',
        type: 'equal-binding',
        fields: [
          { id: 'child-field', type: 'panel-binding-field', modelId: 'child', field: 'width' },
          { id: 'grandchild-field', type: 'panel-binding-field', modelId: 'grandchild', field: 'width' },
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
    pocketOpenings: [{ id: 'opening', type: 'slanted', name: 'Opening', slantOffset: 2, slantSide: 'start' }],
    bindings: {
      reference: {
        id: 'reference',
        type: 'equal-binding',
        fields: [
          { id: 't-field', type: 't-pocket-binding-field', modelId: 't', field: 'openingId' },
          { id: 'front-field', type: 'front-pocket-binding-field', modelId: 'front', field: 'openingId' },
        ],
      },
      opening: {
        id: 'opening-binding',
        type: 'equal-binding',
        fields: [{ id: 'opening-field', type: 'slanted-binding-field', modelId: 'opening', field: 'slantOffset' }],
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
    expect(params.bindings).toEqual({ linked: { action: 'ignore' } })
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
    params.bindings.linked.action = 'add-to-existing'
    params.children.child.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.grandchild.action).toBe('ignore')
    expect(params.holes).toEqual({})
    expect(params.stitchLines).toEqual({})
    expect(params.bindings).toEqual({})
    expect(getCloneComponentSelection(source, params).components[2].disabled).toBe(true)
    params.children.child.action = 'clone'
    params = normalizeCloneComponentParams(source, params)
    expect(params.children.grandchild.action).toBe('ignore')
    expect(params.holes.hole.action).toBe('clone')
    expect(params.stitchLines.stitch.action).toBe('clone')
    expect(params.bindings.linked.action).toBe('ignore')
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

  it('keeps a binding with one new field, but resets separate creation to ignore', () => {
    const source = fixture()
    const params = createCloneComponentParams(source, 'panel')
    params.bindings.linked.action = 'bind-separately'
    params.children.grandchild.action = 'ignore'
    const normalized = normalizeCloneComponentParams(source, params)
    expect(normalized.bindings.linked.action).toBe('ignore')
    expect(getCloneComponentSelection(source, normalized).bindings[0]).toMatchObject({
      canAddToExisting: true,
      canBindSeparately: false,
      fields: [{ modelId: 'child' }],
    })
    normalized.bindings.linked.action = 'add-to-existing'
    expect(normalizeCloneComponentParams(source, normalized).bindings.linked.action).toBe('add-to-existing')
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
      params.bindings.reference.action = 'add-to-existing'
      const normalized = normalizeCloneComponentParams(source, params)
      expect(normalized.bindings.reference.action).toBe('ignore')
      const selection = getCloneComponentSelection(source, normalized)
      expect(selection.clonedModelIds.has('opening')).toBe(action === 'clone')
      expect(selection.bindings.find((row) => row.binding.id === 'reference')?.canAddToExisting).toBe(false)
      expect(selection.bindings.some((row) => row.binding.id === 'opening-binding')).toBe(action === 'clone')
    },
  )

  it('permits adding a reference field when resetting to the already referenced default', () => {
    const source = pocketFixture()
    source.defaultPocketOpening = 'opening'
    const params = createCloneComponentParams(source, 'panel')
    params.pocketOpenings.opening = { action: 'set-to-default' }
    params.bindings.reference.action = 'add-to-existing'
    expect(normalizeCloneComponentParams(source, params).bindings.reference.action).toBe('add-to-existing')
  })

  it('lists bindings on holes and stitch lines only when those models will be cloned', () => {
    const source = fixture()
    source.bindings.owned = {
      id: 'owned',
      type: 'equal-binding',
      fields: [
        { id: 'hole-width', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
        {
          id: 'stitch-margin',
          type: 'component-bounds-stitch-line-binding-field',
          modelId: 'stitch',
          field: 'stitchMargin',
        },
      ],
    }
    let params = createCloneComponentParams(source, 'panel')
    expect(params.bindings.owned.action).toBe('ignore')
    params.holes.hole.action = 'ignore'
    params = normalizeCloneComponentParams(source, params)
    expect(params.bindings.owned).toBeUndefined()
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
