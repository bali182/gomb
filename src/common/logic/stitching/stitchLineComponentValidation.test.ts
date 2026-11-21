import { describe, expect, it } from 'vitest'
import { normalizeStitchLineComponents } from '../../component-patches/normalizeStitchLineComponents'
import { defaultStitchingSettings } from '../../defaultStates'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getComputedSubProject } from '../getComputedSubProject'
import { normalizeStitchLineEntryAndExit } from './stitchLineComponentValidation'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', width: 100, height: 100 }),
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['lower', 'owner', 'cluster'] }),
    backFace: d.rootPanelFace({ id: 'root-back', children: ['rear'] }),
    components: [
      d.panel({ id: 'lower' }),
      d.panel({ id: 'owner' }),
      d.panel({ id: 'rear', children: ['rear-child'] }),
      d.panel({ id: 'rear-child' }),
      d.pocketCluster({ id: 'cluster', children: ['pocket-a', 'pocket-b', 'front'] }),
      d.tPocket({ id: 'pocket-a' }),
      d.tPocket({ id: 'pocket-b' }),
      d.frontPocket({ id: 'front' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'owner' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'bounds', targetType: 'component', targetId: 'owner' }),
      d.componentBoundsStitchLine({ id: 'face', targetType: 'component', targetId: 'root-front' }),
      d.componentBoundsStitchLine({ id: 'back', targetType: 'component', targetId: 'rear' }),
      d.componentBoundsStitchLine({ id: 'hole-line', targetType: 'hole', targetId: 'hole' }),
      d.componentBoundsStitchLine({ id: 'cluster-line', targetType: 'component', targetId: 'cluster' }),
      d.tPocketStitchLine({ id: 'shared', targetType: 'component', targetId: 'cluster' }),
      d.tPocketStitchLine({ id: 'local', targetType: 'component', targetId: 'pocket-a' }),
    ],
  })

describe('component layer order', () => {
  it('orders the complete physical stack from either face, without introducing cluster or face material', () => {
    const source = fixture()
    const accessor = accessors.subProject(source)
    const front = ['rear-child', 'rear', 'root', 'lower', 'owner', 'pocket-a', 'pocket-b', 'front']
    expect(accessor.component.layerIds('root-front')).toEqual(front)
    expect(accessor.component.layerIds('root-back')).toEqual([...front].reverse())
    expect(accessor.component.layers('root-front').map((component) => component.id)).toEqual(front)
    expect(accessor.component.layerIds('root-front')).toBe(accessor.component.layerIds('root-front'))
    expect(accessor.optional.component.layers('missing')).toEqual([])
    expect(() => accessor.component.layers('missing')).toThrow('Missing root panel face')
  })
})

describe('stitch component resolution', () => {
  it('resolves defaults without persisting them, including cluster, hole and reverse-face owners', () => {
    const source = fixture()
    const before = structuredClone(source)
    const accessor = accessors.subProject(source)
    expect(accessor.stitchLine.defaultEntryComponentId('face')).toBe('root-front')
    expect(accessor.stitchLine.defaultEntryComponentId('bounds')).toBe('owner')
    expect(accessor.stitchLine.defaultEntryComponentId('hole-line')).toBe('owner')
    expect(accessor.stitchLine.defaultEntryComponentId('cluster-line')).toBe('front')
    expect(accessor.stitchLine.defaultExitComponentId('bounds')).toBe('root-back')
    expect(accessor.stitchLine.defaultExitComponentId('back')).toBe('root-front')
    expect(accessor.stitchLine.entryComponent('shared', 'pocket-b').id).toBe('pocket-b')
    expect(accessor.stitchLine.entryComponent('local').id).toBe('pocket-a')
    expect(accessor.stitchLine.exitComponent('shared').id).toBe('root-back')
    expect(source).toEqual(before)
  })

  it('does not validate or silently replace an explicit missing or wrong-side reference', () => {
    const base = fixture()
    const source = {
      ...base,
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'missing',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'gone',
          exitComponentId: 'gone',
        }),
        d.componentBoundsStitchLine({
          id: 'wrong-side',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'rear',
        }),
      ],
    }
    const accessor = accessors.subProject(source)
    expect(accessor.optional.stitchLine.entryComponent('missing')).toBeUndefined()
    expect(accessor.optional.stitchLine.exitComponent('missing')).toBeUndefined()
    expect(() => accessor.stitchLine.entryComponent('missing')).toThrow('Missing entry component')
    expect(() => accessor.stitchLine.exitComponent('missing')).toThrow('Missing exit component')
    expect(accessor.stitchLine.entryComponent('wrong-side').id).toBe('rear')
    expect(normalizeStitchLineEntryAndExit('wrong-side', accessor)?.entryComponentValid).toBe(false)
    expect(accessor.optional.stitchLine.defaultEntryComponentId('unknown')).toBeUndefined()
    expect(() => accessor.stitchLine.defaultExitComponentId('unknown')).toThrow('Missing default exit component')
  })

  it('uses the cluster material parent for T-pocket exit and prevents shallower overrides', () => {
    const base = fixture()
    const lower = accessors.subProject(base).component.panel('lower')
    const source = {
      ...base,
      components: {
        ...base.components,
        lower: { ...lower, children: ['cluster'] },
        'root-front': {
          ...accessors.subProject(base).component.rootPanelFace('root-front'),
          children: ['lower', 'owner'],
        },
      },
      stitchLines: [
        d.tPocketStitchLine({
          id: 'shared',
          targetType: 'component',
          targetId: 'cluster',
          exitComponentId: 'pocket-a',
        }),
      ],
    }
    const accessor = accessors.subProject(source)
    expect(accessor.stitchLine.defaultExitComponentId('shared')).toBe('lower')
    expect(accessor.stitchLine.exitComponent('shared').id).toBe('pocket-a')
    expect(normalizeStitchLineEntryAndExit('shared', accessor, 'pocket-a')).toMatchObject({
      exitComponentValid: false,
      exitComponent: { id: 'lower' },
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.stitchLines.shared.routes.map((route) => route.entryComponentId)).toEqual(['pocket-a', 'pocket-b'])
    expect(computed.stitchLines.shared.routes.every((route) => route.exitComponentId === 'lower')).toBe(true)
  })
})

describe('stitch component normalization', () => {
  it('resets invalid overrides, retains valid ones below the owner and leaves implicit fields untouched', () => {
    const base = fixture()
    const source = {
      ...base,
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'implicit', targetType: 'component', targetId: 'owner' }),
        d.componentBoundsStitchLine({
          id: 'single',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'lower',
          exitComponentId: 'lower',
        }),
        d.componentBoundsStitchLine({
          id: 'root-entry',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'root',
        }),
        d.componentBoundsStitchLine({
          id: 'face-exit',
          targetType: 'component',
          targetId: 'owner',
          exitComponentId: 'root-front',
        }),
        d.componentBoundsStitchLine({
          id: 'shallower-exit',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'lower',
          exitComponentId: 'owner',
        }),
        d.componentBoundsStitchLine({
          id: 'missing-exit',
          targetType: 'component',
          targetId: 'owner',
          exitComponentId: 'gone',
        }),
        d.componentBoundsStitchLine({
          id: 'crossing',
          targetType: 'component',
          targetId: 'owner',
          exitComponentId: 'rear-child',
        }),
      ],
    }
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const patched = normalizeStitchLineComponents(source, computed)
    const accessor = accessors.subProject(patched)
    expect(patched.stitchLines[0]).toBe(source.stitchLines[0])
    expect(accessor.stitchLine.bounds('single')).toMatchObject({ entryComponentId: 'lower', exitComponentId: 'lower' })
    expect(accessor.stitchLine.bounds('root-entry').entryComponentId).toBeUndefined()
    expect(accessor.stitchLine.bounds('face-exit').exitComponentId).toBeUndefined()
    expect(accessor.stitchLine.bounds('shallower-exit')).toMatchObject({
      entryComponentId: 'lower',
      exitComponentId: undefined,
    })
    expect(accessor.stitchLine.bounds('missing-exit').exitComponentId).toBeUndefined()
    expect(accessor.stitchLine.bounds('crossing').exitComponentId).toBe('rear-child')
    expect(normalizeStitchLineComponents(patched, computed)).toBe(patched)
    expect(computed.stitchLines.single.routes[0]).toMatchObject({ entryComponentId: 'lower', exitComponentId: 'lower' })
    expect(source.stitchLines[2]).toMatchObject({ entryComponentId: 'root' })
  })
})

it('normalizes an explicit T-pocket exit even when a cluster currently has no T-pockets', () => {
  const source = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
    components: [d.pocketCluster({ id: 'cluster', children: ['front'] }), d.frontPocket({ id: 'front' })],
    stitchLines: [
      d.tPocketStitchLine({ id: 'shared', targetType: 'component', targetId: 'cluster', exitComponentId: 'root' }),
    ],
  })
  const computed = getComputedSubProject(source, defaultStitchingSettings)
  expect(computed.stitchLines.shared.routes).toEqual([])
  const patched = normalizeStitchLineComponents(source, computed)
  expect(patched.stitchLines[0].exitComponentId).toBeUndefined()
})
