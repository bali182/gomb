import { describe, expect, it } from 'vitest'
import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import { POSITION_EPSILON } from '../constants/layout'
import { defaultStitchingSettings } from '../defaultStates'
import { addComponent } from '../operations/subProject/addComponent'
import { addHole } from '../operations/subProject/addHole'
import { cloneComponent } from '../operations/subProject/cloneComponent'
import { deleteComponent } from '../operations/subProject/deleteComponent'
import { flip } from '../operations/subProject/flip'
import { moveComponent } from '../operations/subProject/moveComponent'
import { setStretchBinding } from '../operations/subProject/setStretchBinding'
import { createBaseOperationParams } from '../operations/subProject/testUtils'
import { createCloneComponentParams } from '../operations/subProject/utils/cloneComponentSelection'
import { canAddChild, canAddHole } from '../operations/subProject/utils/componentRules'
import type { GuideSchema } from '../schemas/components'
import type { SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { getSubProjectDiff } from '../utils/getSubProjectDiff'
import { isDefined } from '../utils/isDefined'
import { applyResolution } from './bindings/applyResolution'
import { getCommonBindingProperties } from './bindings/bindingCreationUtils'
import { getBindingFieldInputs } from './bindings/getBindingFieldInputs'
import { getExportChildMarkerPaths } from './exports/getExportChildMarkerPaths'
import { getExportElementsForComponent } from './exports/getExportElements'
import { getComputedSubProject } from './getComputedSubProject'
import { normalizeStitchLineEntryAndExit } from './stitching/stitchLineComponentValidation'

const fixture = (fields: Partial<GuideSchema> = {}): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', width: 100, height: 80, topLeftRadius: 20 }),
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['guide'] }),
    components: [d.guide({ id: 'guide', ...fields })],
  })

describe('Guide layout and geometry', () => {
  it('creates resolvable Guide stretch bindings and blocks automatic dimensions', () => {
    const source = fixture()
    const guide = accessors.subProject(source).component.guide('guide')
    const properties = getCommonBindingProperties(source, [guide])
    expect(properties.find((property) => property.field === 'width')?.blockers[0]?.autoReason).toBe('auto-width')
    expect(properties.find((property) => property.field === 'layoutGap')?.blockers).toEqual([])
    expect(getBindingFieldInputs(guide).every((input) => input.type === 'guide-binding-field')).toBe(true)
    const updated: SubProjectSchema = {
      ...source,
      components: { ...source.components, guide: { ...guide, topStretch: 12, bottomStretch: -7 } },
    }
    const linked = setStretchBinding(createBaseOperationParams(updated), {
      modelId: 'guide',
      fields: ['bottomStretch', 'topStretch'],
    })
    expect(Object.values(linked.bindings)[0].fields.every((field) => field.type === 'guide-binding-field')).toBe(true)
    const resolved = applyResolution({ input: updated, target: linked, inputDiff: getSubProjectDiff(updated, linked) })
    expect(accessors.subProject(resolved).component.guide('guide').bottomStretch).toBe(12)
  })

  it('clones a Guide subtree with its stitching, moves it between allowed parents and deletes it', () => {
    const original = fixture({ children: ['child'] })
    const source: SubProjectSchema = {
      ...original,
      components: {
        ...original.components,
        'root-front': d.rootPanelFace({ id: 'root-front', children: ['guide', 'target'] }),
        child: d.panel({ id: 'child' }),
        target: d.panel({ id: 'target' }),
      },
      stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetType: 'component', targetId: 'guide' })],
    }
    const cloned = cloneComponent(createBaseOperationParams(source), createCloneComponentParams(source, 'guide'))
    const clone = accessors
      .subProject(cloned)
      .component.guides()
      .find((guide) => guide.id !== 'guide')
    expect(clone).toBeDefined()
    if (!isDefined(clone)) {
      throw new Error('Missing Guide clone')
    }
    expect(clone.children).toHaveLength(1)
    expect(clone.children[0]).not.toBe('child')
    expect(cloned.stitchLines.some((stitchLine) => stitchLine.targetId === clone.id)).toBe(true)
    const moved = moveComponent(createBaseOperationParams(cloned), {
      id: clone.id,
      targetParentId: 'target',
      beforeComponentId: undefined,
    })
    expect(accessors.subProject(moved).component.parent(clone.id).id).toBe('target')
    expect(
      moveComponent(createBaseOperationParams(moved), {
        id: clone.id,
        targetParentId: 'guide',
        beforeComponentId: undefined,
      }),
    ).toBe(moved)
    const deleted = deleteComponent(createBaseOperationParams(moved), { id: clone.id })
    expect(accessors.subProject(deleted).optional.component.byId(clone.id)).toBeUndefined()
    expect(accessors.subProject(deleted).optional.component.byId(clone.children[0])).toBeUndefined()
    expect(accessors.subProject(deleted).component.guide('guide').children).toEqual(['child'])
  })

  it('rejects new holes on Guide and removes unsupported saved holes', () => {
    const source = fixture()
    expect(addHole(createBaseOperationParams(source), { targetId: 'guide' })).toBe(source)
    const saved = { ...source, holes: [d.hole({ id: 'hole', componentId: 'guide' })] }
    const computed = getComputedSubProject(saved, defaultStitchingSettings)
    expect(computed.holes).toEqual({})
    expect(getPatchedSubProject(saved, computed).holes).toEqual([])
  })

  it('passes layout and effective radii through multiple Guides separated by a panel', () => {
    const original = fixture({
      autoWidth: false,
      autoHeight: false,
      width: 60,
      height: 40,
      xAnchor: 'start',
      yAnchor: 'start',
      xOffset: 5,
      topLeftRadius: 7,
      children: ['panel'],
    })
    const source: SubProjectSchema = {
      ...original,
      components: {
        ...original.components,
        panel: d.panel({ id: 'panel', children: ['inner-guide'] }),
        'inner-guide': d.guide({ id: 'inner-guide', children: ['leaf'] }),
        leaf: d.panel({ id: 'leaf' }),
      },
    }
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    const guide = accessor.component.guide('guide')
    expect(accessor.component.guide('inner-guide').boundingRect).toEqual(guide.boundingRect)
    expect(accessor.component.panel('leaf').boundingRect).toEqual(guide.boundingRect)
    expect(accessor.component.panel('leaf').cornerRadius.topLeft.toNumber()).toBe(7)
    expect(accessors.subProject(source).component.layerIds('root-front')).toEqual(['root', 'panel', 'leaf'])
    expect(
      getExportElementsForComponent(source, computed, 'root', defaultStitchingSettings).map((element) => element.id),
    ).toEqual(['root', 'panel', 'leaf'])
  })

  it.each(['face', 'panel', 'front-pocket'] as const)(
    'resolves stitching through a Guide carried by a %s',
    (parentType) => {
      const source = d.subProject({
        id: 'sub',
        root: d.rootPanel({ id: 'root' }),
        frontFace: d.rootPanelFace({
          id: 'root-front',
          children: [parentType === 'face' ? 'guide' : parentType === 'panel' ? 'parent' : 'parent-cluster'],
        }),
        components: [
          ...(parentType === 'panel' ? [d.panel({ id: 'parent', children: ['guide'] })] : []),
          ...(parentType === 'front-pocket'
            ? [
                d.pocketCluster({ id: 'parent-cluster', children: ['parent'] }),
                d.frontPocket({ id: 'parent', children: ['guide'] }),
              ]
            : []),
          d.guide({ id: 'guide', children: ['cluster'] }),
          d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
          d.tPocket({ id: 't' }),
          d.frontPocket({ id: 'front' }),
        ],
        stitchLines: [
          d.componentBoundsStitchLine({ id: 'guide-stitch', targetType: 'component', targetId: 'guide' }),
          d.tPocketStitchLine({ id: 'pocket-stitch', targetType: 'component', targetId: 'cluster' }),
        ],
      })
      const accessor = accessors.subProject(source)
      expect(accessor.stitchLine.defaultEntryComponentId('guide-stitch')).toBe(
        parentType === 'face' ? 'root-front' : 'parent',
      )
      expect(accessor.stitchLine.defaultExitComponentId('pocket-stitch')).toBe(
        parentType === 'face' ? 'root-back' : 'parent',
      )
      const computed = getComputedSubProject(source, defaultStitchingSettings)
      expect(computed.stitchLines['pocket-stitch'].routes[0].exitComponentId).toBe(
        parentType === 'face' ? 'root-back' : 'parent',
      )
      expect(accessor.component.layerIds('root-front')).not.toContain('guide')
    },
  )

  it('does not consume parent layout space, automatic sizes or automatic gaps', () => {
    const original = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 80 }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['first', 'second'], autoLayoutGap: true }),
      components: [
        d.panel({ id: 'first', autoWidth: false, width: 20 }),
        d.panel({ id: 'second', autoWidth: false, width: 30 }),
      ],
    })
    const source: SubProjectSchema = {
      ...original,
      components: {
        ...original.components,
        guide: d.guide({ id: 'guide' }),
        'root-front': {
          ...accessors.subProject(original).component.rootPanelFace('root-front'),
          children: ['first', 'guide', 'second'],
        },
      },
    }
    const before = getComputedSubProject(original, defaultStitchingSettings)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.components.first).toEqual(before.components.first)
    expect(computed.components.second).toEqual(before.components.second)
    expect(
      accessors.computedSubProject(computed).component.rootPanelFace('root-front').computedLayoutGap.toNumber(),
    ).toBe(50)
    expect(accessors.computedSubProject(computed).component.guide('guide').boundingRect).toEqual(
      computed.components.root.boundingRect,
    )
    expect(accessors.computedSubProject(computed).component.childIds('root-front')).toEqual([
      'first',
      'guide',
      'second',
    ])
    expect(
      accessors.subProject(getPatchedSubProject(source, computed)).component.rootPanelFace('root-front').layoutGap,
    ).toBe(50)
  })

  it('lays out physical children in its stretched box and writes only auto base sizes', () => {
    const original = fixture({
      children: ['left', 'right'],
      xOffset: -20,
      rightStretch: 10,
      topStretch: 5,
      layoutGap: 10,
    })
    const source: SubProjectSchema = {
      ...original,
      components: { ...original.components, left: d.panel({ id: 'left' }), right: d.panel({ id: 'right' }) },
    }
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    const guide = accessor.component.guide('guide')
    expect(guide.boundingRect.x.toNumber()).toBe(-20)
    expect(guide.boundingRect.y.toNumber()).toBe(-5)
    expect(guide.boundingRect.width.toNumber()).toBe(110)
    expect(accessor.component.panel('left').boundingRect.width.toNumber()).toBe(50)
    expect(accessor.component.panel('right').boundingRect.x.toNumber()).toBe(40)
    const patched = getPatchedSubProject(source, computed)
    expect(accessors.subProject(patched).component.guide('guide')).toMatchObject({ width: 100, height: 80 })
    expect(getPatchedSubProject(patched, getComputedSubProject(patched, defaultStitchingSettings))).toBe(patched)
  })

  it.each([0, 3])('discards an oversized inherited radius and uses its own radius %s', (topLeftRadius) => {
    const source = fixture({
      autoWidth: false,
      autoHeight: false,
      width: 10,
      height: 10,
      xAnchor: 'start',
      yAnchor: 'start',
      topLeftRadius,
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(accessors.computedSubProject(computed).component.guide('guide').cornerRadius.topLeft.toNumber()).toBe(
      topLeftRadius,
    )
    const limits = computed.limits.components.guide
    if (limits.type !== 'guide') {
      throw new Error('Expected Guide limits')
    }
    expect(limits.topLeftRadius?.min).toBeUndefined()
  })

  it('inherits only at final touching corners and passes its effective radius to children', () => {
    const original = fixture({
      autoWidth: false,
      autoHeight: false,
      width: 30,
      height: 30,
      xAnchor: 'start',
      yAnchor: 'start',
      children: ['child'],
    })
    const source: SubProjectSchema = {
      ...original,
      components: { ...original.components, child: d.panel({ id: 'child' }) },
    }
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(accessors.computedSubProject(computed).component.guide('guide').cornerRadius.topLeft.toNumber()).toBe(20)
    expect(accessors.computedSubProject(computed).component.panel('child').cornerRadius.topLeft.toNumber()).toBe(20)
    const stretched: SubProjectSchema = {
      ...source,
      components: {
        ...source.components,
        guide: { ...accessors.subProject(source).component.guide('guide'), leftStretch: 5 },
      },
    }
    const after = getComputedSubProject(stretched, defaultStitchingSettings)
    expect(accessors.computedSubProject(after).component.guide('guide').cornerRadius.topLeft.toNumber()).toBe(0)
  })

  it('supports zero manual dimensions and excessive compression with finite geometry', () => {
    const computed = getComputedSubProject(
      fixture({ autoWidth: false, autoHeight: false, width: 0, height: 0, leftStretch: -100, topStretch: -100 }),
      defaultStitchingSettings,
    )
    const guide = accessors.computedSubProject(computed).component.guide('guide')
    expect(guide.boundingRect.width.toNumber()).toBe(POSITION_EPSILON)
    expect(guide.boundingRect.height.toNumber()).toBe(POSITION_EPSILON)
    expect(JSON.stringify(computed)).not.toMatch(/NaN|Infinity/)
  })

  it('has no export piece or marker while its physical children are exported and marked', () => {
    const source = fixture()
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(getExportElementsForComponent(source, computed, 'guide', defaultStitchingSettings)).toEqual([])
    expect(getExportChildMarkerPaths(computed.components.root, computed)).toEqual([])
    const withChildren: SubProjectSchema = {
      ...source,
      components: {
        ...source.components,
        guide: {
          ...accessors.subProject(source).component.guide('guide'),
          children: ['child'],
          autoWidth: false,
          autoHeight: false,
          width: 30,
          height: 20,
        },
        child: d.panel({ id: 'child' }),
      },
    }
    const withComputed = getComputedSubProject(withChildren, defaultStitchingSettings)
    expect(
      getExportElementsForComponent(withChildren, withComputed, 'root', defaultStitchingSettings).map(
        (element) => element.id,
      ),
    ).toEqual(['root', 'child'])
    expect(getExportChildMarkerPaths(withComputed.components.root, withComputed)).toHaveLength(4)
    expect(accessors.subProject(withChildren).component.layerIds('root-front')).toEqual(['root', 'child'])
  })

  it('restricts Guide parents, accepts physical children and disallows holes', () => {
    const source = fixture()
    const guide = accessors.subProject(source).component.guide('guide')
    expect(canAddChild(guide, 'guide', source)).toBe(false)
    expect(canAddChild(guide, 'panel', source)).toBe(true)
    expect(canAddChild(guide, 'pocket-cluster', source)).toBe(true)
    expect(canAddHole(guide)).toBe(false)
    expect(addComponent(createBaseOperationParams(source), { parentId: 'guide', position: 'end', type: 'guide' })).toBe(
      source,
    )
  })

  it.each(['horizontal', 'vertical'] as const)(
    'mirrors anchored position, layout and asymmetric stretch along %s',
    (axis) => {
      const source = fixture({
        xAnchor: 'start',
        yAnchor: 'end',
        leftStretch: 2,
        rightStretch: 3,
        topStretch: 4,
        bottomStretch: 5,
      })
      const guide = accessors.subProject(source).component.guide('guide')
      const result = flip(createBaseOperationParams(source), { model: guide, axis })
      expect(accessors.subProject(result).component.guide('guide')).toMatchObject(
        axis === 'horizontal'
          ? { xAnchor: 'end', leftStretch: 3, rightStretch: 2 }
          : { yAnchor: 'start', topStretch: 5, bottomStretch: 4 },
      )
      expect(
        flip(createBaseOperationParams(result), { model: accessors.subProject(result).component.guide('guide'), axis }),
      ).toEqual(source)
    },
  )

  it('uses its physical parent as the default stitch entry while retaining its own geometry', () => {
    const original = fixture({ autoWidth: false, autoHeight: false, width: 30, height: 20, xOffset: 10 })
    const source: SubProjectSchema = {
      ...original,
      stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetType: 'component', targetId: 'guide' })],
    }
    const accessor = accessors.subProject(source)
    expect(accessor.stitchLine.defaultEntryComponentId('stitch')).toBe('root-front')
    expect(normalizeStitchLineEntryAndExit('stitch', accessor)?.entryComponent.id).toBe('root-front')
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.stitchLines.stitch.routes[0].targetId).toBe('guide')
    expect(computed.stitchLines.stitch.routes[0].entryComponentId).toBe('root-front')
    const exported = getExportElementsForComponent(source, computed, 'root', defaultStitchingSettings)
    expect(exported).toHaveLength(1)
    expect(exported[0].stitchLines.flatMap((stitchLine) => stitchLine.paths).length).toBeGreaterThan(0)
  })
})
