import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import { POSITION_EPSILON } from '../constants/layout'
import { defaultExportParams, defaultStitchingSettings } from '../defaultStates'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOrientationSchema,
  SlantedPocketOpeningSchema,
} from '../schemas/components'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { getExportElementsForComponent } from './exports/getExportElements'
import { getComputedSubProject } from './getComputedSubProject'
import { isPointInClosedPath } from './isPointInClosedPath'
import { getClosedPathLoops, getPathSegments } from './pathSegments'

describe.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
  'physical pocket components: %s',
  (orientation) => {
    const vertical = orientation === 'up' || orientation === 'down'
    it('keeps material when optical opening insets request the entire width', () => {
      const opening: OpticalIllusionPocketOpeningSchema = {
        type: 'optical-illusion',
        direction: 'start',
        startInset: 100,
        endInset: 0,
        leadingRadius: 0,
        trailingRadius: 0,
      }
      const front = d.frontPocket({ id: 'front', opening })
      const cluster = d.pocketCluster({ id: 'cluster', orientation, children: [front.id], pocketStep: 80 })
      const root = d.rootPanel({
        id: 'root',
        width: vertical ? 100 : 80,
        height: vertical ? 80 : 100,
        children: [cluster.id],
      })
      const source = d.subProject({ id: 'sub', root, components: [cluster, front] })
      const snapshot = structuredClone(source)
      const computed = accessors.computedSubProject(getComputedSubProject(source, defaultStitchingSettings))
      const path = computed.component.frontPocket(front.id).path
      const area = getClosedPathLoops(path)
        .flat()
        .reduce(
          (sum, segment) => sum.plus(segment.start.x.times(segment.end.y).minus(segment.end.x.times(segment.start.y))),
          new BigNumber(0),
        )
        .abs()
        .dividedBy(2)
      expect(area.gt(0)).toBe(true)
      expect(computed.component.pocketCluster(cluster.id).path.commands.length).toBeGreaterThan(0)
      expect(source).toEqual(snapshot)
    })

    const fixture = (offset = 15) => {
      const opening: SlantedPocketOpeningSchema = { type: 'slanted', offset, side: 'end' }
      const pockets = [
        d.tPocket({ id: 't1', opening, tPocketTabWidth: 10, tPocketTaper: 35 }),
        d.tPocket({ id: 't2', opening }),
        d.frontPocket({ id: 'front', opening }),
      ]
      const cluster = d.pocketCluster({
        id: 'cluster',
        orientation,
        pocketStep: 20,
        children: pockets.map((pocket) => pocket.id),
      })
      const root = d.rootPanel({
        id: 'root',
        width: vertical ? 100 : 130,
        height: vertical ? 130 : 100,
        children: [cluster.id],
      })
      const subProject = d.subProject({
        id: 'sub',
        root,
        components: [cluster, ...pockets],
        stitchLines: [
          d.tPocketStitchLine({ id: 'bottom', targetId: 't1', targetType: 'component', stitchMargin: 15 }),
          d.componentBoundsStitchLine({ id: 'border', targetId: 'cluster', targetType: 'component' }),
        ],
      })
      return { cluster, pockets, subProject }
    }
    it('registers pockets under their own IDs, preserves allocation and clips their own stitching', () => {
      const { cluster, subProject } = fixture()
      const before = structuredClone(subProject)
      const computed = getComputedSubProject(subProject, defaultStitchingSettings)
      const accessor = accessors.computedSubProject(computed)
      const result = accessor.component.pocketCluster(cluster.id)
      expect(result.children).toEqual(['t1', 't2', 'front'])
      result.children.forEach((pocketId, index) => {
        const pocket = accessor.component.pocket(pocketId)
        expect(pocket.componentId).toBe(pocketId)
        expect((vertical ? pocket.boundingRect.height : pocket.boundingRect.width).toNumber()).toBe(90)
        expect((vertical ? pocket.boundingRect.y : pocket.boundingRect.x).toNumber()).toBe(
          (orientation === 'up' || orientation === 'left' ? index : 2 - index) * 20,
        )
        expect(getClosedPathLoops(pocket.path)).toHaveLength(1)
      })
      expect(computed.stitchLines.bottom.routes).toHaveLength(1)
      expect(computed.stitchLines.border.type).toBe('component-bounds-stitch-line')
      const elements = getExportElementsForComponent(
        subProject,
        computed,
        'cluster',
        { ...defaultExportParams, stitchLineMode: 'related-stitch-lines' },
        defaultStitchingSettings,
      )
      expect(elements.map((element) => element.id)).toEqual(['t1', 't2', 'front'])
      expect(elements[0].stitchLines.some((line) => line.stitchLine.id === 'bottom')).toBe(true)
      expect(
        elements.slice(1).every((element) => !element.stitchLines.some((line) => line.stitchLine.id === 'bottom')),
      ).toBe(true)
      expect(subProject).toEqual(before)
    })
    it.each(['own-stitch-lines', 'related-stitch-lines', 'all-stitch-lines'] as const)(
      'keeps the cluster border on every pocket in %s exports',
      (stitchLineMode) => {
        const { subProject } = fixture()
        const computed = getComputedSubProject(subProject, defaultStitchingSettings)
        const elements = getExportElementsForComponent(
          subProject,
          computed,
          'cluster',
          { ...defaultExportParams, stitchLineMode },
          defaultStitchingSettings,
        )
        expect(elements).toHaveLength(3)
        for (const element of elements) {
          expect(element.stitchLines.some((line) => line.stitchLine.id === 'border')).toBe(true)
        }
      },
    )
    it.each(['ID-2', 'HUF'] as const)(
      'computes each pocket item from its own configuration with %s in front',
      (itemId) => {
        const { subProject } = fixture()
        const source = accessors.subProject(subProject)
        const changed = {
          ...subProject,
          components: {
            ...subProject.components,
            t1: { ...source.component.tPocket('t1'), itemId: 'ID-1' as const, itemCrossAxisOffset: 3 },
            front: {
              ...source.component.frontPocket('front'),
              itemId,
              itemOrientation: 'portrait' as const,
              itemOpeningOffset: 7,
            },
          },
        }
        const computed = accessors.computedSubProject(getComputedSubProject(changed, defaultStitchingSettings))
        const t = computed.component.tPocket('t1')
        const front = computed.component.frontPocket('front')
        expect(t.item?.item.id).toBe('ID-1')
        expect(computed.component.tPocket('t2').item).toBeUndefined()
        expect(front.item?.item.id).toBe(itemId)
        expect(t.item?.boundingRect.width.toNumber()).toBe(85.6)
        expect(front.item?.boundingRect.width.toNumber()).toBe(itemId === 'HUF' ? 70 : 74)
        expect(t.item?.boundingRect).not.toEqual(front.item?.boundingRect)
      },
    )
    it('stores independent opening bounds under each pocket component', () => {
      const { subProject } = fixture(1000)
      const computed = getComputedSubProject(subProject, defaultStitchingSettings)
      expect(computed.limits.components.t1).toMatchObject({
        type: 't-pocket',
        opening: { type: 'slanted', offset: { max: { value: new BigNumber(70) } } },
      })
      expect(computed.limits.components.front).toMatchObject({
        type: 'front-pocket',
        opening: { type: 'slanted', offset: { max: { value: new BigNumber(90) } } },
      })
      const accessor = accessors.computedSubProject(computed)
      const cluster = accessor.component.pocketCluster('cluster')
      for (const pocketId of cluster.children) {
        const pocket = accessor.component.pocket(pocketId)
        for (const segment of getPathSegments(pocket.path)) {
          expect(segment.start.x.isFinite() && segment.start.y.isFinite()).toBe(true)
        }
      }
    })
    it('bounds step and each T-pocket shape independently', () => {
      const { subProject } = fixture()
      const source = accessors.subProject(subProject)
      const changed = {
        ...subProject,
        components: {
          ...subProject.components,
          cluster: { ...source.component.pocketCluster('cluster'), pocketStep: 500 },
          t1: { ...source.component.tPocket('t1'), tPocketTabWidth: 500, tPocketTaper: 500 },
        },
      }
      const computed = getComputedSubProject(changed, defaultStitchingSettings)
      expect(computed.limits.components.cluster).toMatchObject({
        pocketStep: { max: { value: new BigNumber(130).dividedBy(3) } },
      })
      expect(computed.limits.components.t1).toMatchObject({
        tPocketTabWidth: { max: { value: new BigNumber(50).minus(POSITION_EPSILON) } },
        tPocketTaper: { max: { value: new BigNumber(50).minus(POSITION_EPSILON) } },
      })
    })
    it.each([
      { parentRadius: 12, clusterRadius: 0, frontRadius: 0, expectedCluster: 12, expectedFront: 12 },
      { parentRadius: 12, clusterRadius: 20, frontRadius: 0, expectedCluster: 20, expectedFront: 20 },
      { parentRadius: 12, clusterRadius: 20, frontRadius: 30, expectedCluster: 20, expectedFront: 30 },
      { parentRadius: 0, clusterRadius: 20, frontRadius: 0, expectedCluster: 20, expectedFront: 20 },
    ])(
      'inherits radii from parent $parentRadius through cluster $clusterRadius to front $frontRadius',
      ({ parentRadius, clusterRadius, frontRadius, expectedCluster, expectedFront }) => {
        const { subProject } = fixture(1)
        const source = accessors.subProject(subProject)
        const root = source.component.rootPanel()
        const changed = {
          ...subProject,
          components: {
            ...subProject.components,
            root: {
              ...root,
              topLeftRadius: parentRadius,
              topRightRadius: parentRadius,
              bottomLeftRadius: parentRadius,
              bottomRightRadius: parentRadius,
            },
            cluster: {
              ...source.component.pocketCluster('cluster'),
              topLeftRadius: clusterRadius,
              topRightRadius: clusterRadius,
              bottomLeftRadius: clusterRadius,
              bottomRightRadius: clusterRadius,
            },
            front: {
              ...source.component.frontPocket('front'),
              topLeftRadius: frontRadius,
              topRightRadius: frontRadius,
              bottomLeftRadius: frontRadius,
              bottomRightRadius: frontRadius,
            },
          },
          stitchLines: subProject.stitchLines.map((stitchLine) =>
            stitchLine.id === 'border' ? { ...stitchLine, stitchMargin: 2, autoCornerRadius: true } : stitchLine,
          ),
        }
        const before = structuredClone(changed)
        const computed = getComputedSubProject(changed, defaultStitchingSettings)
        const accessor = accessors.computedSubProject(computed)
        const cluster = accessor.component.pocketCluster('cluster')
        const front = accessor.component.frontPocket('front')
        const border = accessor.stitchLine.bounds('border')
        const expected =
          orientation === 'up'
            ? ['bottomLeft', 'bottomRight']
            : orientation === 'down'
              ? ['topLeft', 'topRight']
              : orientation === 'left'
                ? ['topRight', 'bottomRight']
                : ['topLeft', 'bottomLeft']
        for (const [corner, radius] of Object.entries(front.cornerRadius)) {
          expect(radius.toNumber()).toBe(expected.includes(corner) ? expectedFront : 0)
        }
        for (const [corner, radius] of Object.entries(cluster.cornerRadius)) {
          expect(radius.toNumber()).toBe(expected.includes(corner) ? expectedCluster : 0)
        }
        for (const [corner, radius] of Object.entries(border.autoComputedCornerRadius)) {
          expect(radius.toNumber()).toBe(expected.includes(corner) ? expectedCluster - 2 : 0)
        }
        expect(changed).toEqual(before)
      },
    )
    it('lays out normal children inside the front pocket', () => {
      const { subProject } = fixture()
      const front = accessors.subProject(subProject).component.frontPocket('front')
      const child = d.panel({ id: 'child' })
      const changed = {
        ...subProject,
        components: { ...subProject.components, front: { ...front, children: [child.id] }, child },
      }
      const computed = getComputedSubProject(changed, defaultStitchingSettings)
      const parent = accessors.computedSubProject(computed).component.frontPocket('front')
      expect(computed.components.child.boundingRect).toEqual(parent.boundingRect)
      expect(parent.children).toEqual(['child'])
    })
  },
)
describe('invalid pocket states and patchers', () => {
  it('builds the cluster selection contour from the cut pocket contours', () => {
    const cluster = d.pocketCluster({ id: 'cluster', children: ['front'] })
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] }),
      components: [cluster, d.frontPocket({ id: 'front' })],
      holes: [d.hole({ id: 'hole', componentId: 'front', width: 10, height: 10 })],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const center = { x: new BigNumber(50), y: new BigNumber(50) }
    expect(isPointInClosedPath(center, computed.components.front.path)).toBe(false)
    expect(isPointInClosedPath(center, computed.components.cluster.path)).toBe(false)
  })
  it('supports empty and frontless clusters without throwing', () => {
    for (const children of [[], ['t']]) {
      const cluster = d.pocketCluster({ id: 'cluster', children })
      const source = d.subProject({
        id: 'sub',
        root: d.rootPanel({ id: 'root', children: ['cluster'] }),
        components: [cluster, d.tPocket({ id: 't' })],
      })
      const computed = getComputedSubProject(source, defaultStitchingSettings)
      expect(accessors.computedSubProject(computed).component.pocketCluster('cluster').children.length).toBe(
        children.length,
      )
    }
  })
  it('removes forbidden T-pocket descendants, cluster holes and unsupported stitching separately', () => {
    const t = d.tPocket({ id: 't', children: ['zombie'] })
    const front = d.frontPocket({ id: 'front' })
    const zombie = d.panel({ id: 'zombie', children: ['nested'] })
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [cluster, t, front, zombie, d.panel({ id: 'nested' })],
      holes: [
        d.hole({ id: 'cluster-hole', componentId: 'cluster' }),
        d.hole({ id: 'zombie-hole', componentId: 'zombie' }),
      ],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'front-line', targetId: 'front', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'invalid', targetId: 'front', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'orphan', targetId: 'zombie', targetType: 'component' }),
      ],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(computed.components.zombie).toBeUndefined()
    expect(computed.holes).toEqual({})
    const patched = getPatchedSubProject(source, computed)
    expect(patched.components.zombie).toBeUndefined()
    expect(patched.components.nested).toBeUndefined()
    expect(patched.components.t.children).toEqual([])
    expect(patched.holes).toEqual([])
    expect(patched.stitchLines.map((line) => line.id)).toEqual(['front-line'])
    expect(computed.stitchLines['front-line'].routes.length).toBeGreaterThan(0)
  })
})
