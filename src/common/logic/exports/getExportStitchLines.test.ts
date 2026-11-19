import { describe, expect, it } from 'vitest'
import { narrowers } from '../../utils/narrowers'

import { defaultStitchingSettings } from '../../defaultStates'
import { d } from '../../testData'
import { getComputedSubProject } from '../getComputedSubProject'
import { isPointInClosedPath } from '../isPointInClosedPath'
import { getPathSegments } from '../pathSegments'
import { getPathSegmentMidpoint } from '../pathSegmentUtils'
import { getExportStitchLines } from './getExportStitchLines'

const stitchMargins: Record<string, number> = {
  'root-stitch': 4,
  'panel-stitch': 8,
  'child-stitch': 12,
}

describe('getExportStitchLines', () => {
  const expectedIds = ['panel-stitch', 'child-stitch']
  it.each([false, true])('selects and clips stitches with a cutout: %s', (withCutout) => {
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
      id: 'sub-project',
      root: d.rootPanel({ id: 'root', width: 100, height: 100 }),
      components: [d.panel({ id: 'panel', children: ['child'] }), d.panel({ id: 'child' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'root-stitch',
          targetId: 'root-front',
          targetType: 'component',
          stitchMargin: stitchMargins['root-stitch'],
        }),
        d.componentBoundsStitchLine({
          id: 'panel-stitch',
          targetId: 'panel',
          targetType: 'component',
          stitchMargin: stitchMargins['panel-stitch'],
        }),
        d.componentBoundsStitchLine({
          id: 'child-stitch',
          targetId: 'child',
          targetType: 'component',
          stitchMargin: stitchMargins['child-stitch'],
        }),
      ],
      holes: withCutout
        ? [
            {
              ...d.hole({ id: 'cutout', componentId: 'panel' }),
              xAnchor: 'start',
              yAnchor: 'start',
              xOffset: 20,
              yOffset: 0,
              width: 10,
              height: 30,
            },
          ]
        : [],
    })
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const target = computed.components['panel']

    if (!narrowers.is.computedPanel(target)) {
      throw new Error('Expected a computed panel')
    }

    const exported = getExportStitchLines(subProject, computed, target, defaultStitchingSettings)

    expect(exported.map(({ stitchLine }) => stitchLine.id).sort()).toEqual([...expectedIds].sort())

    for (const { stitchLine, paths, holes } of exported) {
      const margin = stitchMargins[stitchLine.id]
      const segments = paths.flatMap((path) => getPathSegments(path))
      const topIntervals = segments
        .filter((segment) => segment.start.y.eq(margin) && segment.end.y.eq(margin))
        .map((segment) => [segment.start.x.toNumber(), segment.end.x.toNumber()].sort((a, b) => a - b))
        .sort((a, b) => a[0] - b[0])

      expect(topIntervals).toEqual(
        withCutout
          ? [
              [margin, 20],
              [30, 100 - margin],
            ]
          : [[margin, 100 - margin]],
      )
      expect(holes.length).toBeGreaterThan(0)

      for (const segment of segments) {
        expect(isPointInClosedPath(getPathSegmentMidpoint(segment), target.path)).toBe(true)
      }

      for (const hole of holes) {
        expect(isPointInClosedPath(hole.center, target.path)).toBe(true)
        if (withCutout) {
          const insideCutout =
            hole.center.x.gt(20) && hole.center.x.lt(30) && hole.center.y.gt(0) && hole.center.y.lt(30)
          expect(insideCutout).toBe(false)
        }
      }
    }
  })
})

describe('cluster T-pocket stitching export', () => {
  const fixture = () =>
    d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 120 }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['a', 'b', 'front'], pocketStep: 0 }),
        d.tPocket({ id: 'a' }),
        d.tPocket({ id: 'b' }),
        d.frontPocket({ id: 'front' }),
      ],
      stitchLines: [
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'local-a', targetId: 'a', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'local-b', targetId: 'b', targetType: 'component' }),
      ],
    })

  it('exports every route that crosses the target layer, even when routes overlap', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const shared = computed.stitchLines.shared
    expect(shared.routes).toHaveLength(2)
    expect(shared.routes[0].path).toEqual(shared.routes[1].path)
    const first = getExportStitchLines(source, computed, computed.components.a, defaultStitchingSettings)
    expect(first.map(({ stitchLine }) => stitchLine.id).sort()).toEqual(['local-a', 'local-b', 'shared'])
    expect(first.find(({ stitchLine }) => stitchLine.id === 'shared')?.paths).toHaveLength(2)
    const second = getExportStitchLines(source, computed, computed.components.b, defaultStitchingSettings)
    expect(second.map(({ stitchLine }) => stitchLine.id).sort()).toEqual(['local-b', 'shared'])
    expect(second.find(({ stitchLine }) => stitchLine.id === 'shared')?.paths).toHaveLength(1)
    expect(getExportStitchLines(source, computed, computed.components.front, defaultStitchingSettings)).toEqual([])
    const root = getExportStitchLines(source, computed, computed.components.root, defaultStitchingSettings)
    expect(root.find(({ stitchLine }) => stitchLine.id === 'shared')?.paths).toHaveLength(2)
    expect(source).toEqual(snapshot)
  })
})

describe('explicit stitching span', () => {
  it('uses the entry layer instead of the geometry owner and stops inclusively at exit', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 100 }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['lower'] }),
      components: [d.panel({ id: 'lower', children: ['owner'] }), d.panel({ id: 'owner' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'stitch',
          targetType: 'component',
          targetId: 'owner',
          entryComponentId: 'lower',
          exitComponentId: 'lower',
        }),
      ],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(getExportStitchLines(source, computed, computed.components.lower, defaultStitchingSettings)).toHaveLength(1)
    expect(getExportStitchLines(source, computed, computed.components.owner, defaultStitchingSettings)).toEqual([])
    expect(getExportStitchLines(source, computed, computed.components.root, defaultStitchingSettings)).toEqual([])
  })

  it('reflects opposite-face holes before clipping and exports every physically crossed layer', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 100 }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['small'] }),
      backFace: d.rootPanelFace({ id: 'root-back', children: ['rear'] }),
      components: [d.panel({ id: 'small', width: 30, autoWidth: false }), d.panel({ id: 'rear' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'crossing',
          targetType: 'component',
          targetId: 'small',
          exitComponentId: 'rear',
        }),
      ],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const route = computed.stitchLines.crossing.routes[0]
    const rear = getExportStitchLines(source, computed, computed.components.rear, defaultStitchingSettings)
    expect(rear).toHaveLength(1)
    expect(rear[0].holes).toHaveLength(route.holes.length)
    for (let index = 0; index < route.holes.length; index++) {
      const original = route.holes[index]
      const reflected = rear[0].holes[index]
      expect(reflected.center.x.toNumber()).toBeCloseTo(100 - original.center.x.toNumber())
      expect(reflected.center.y.eq(original.center.y)).toBe(true)
      expect(reflected.line.start.x.toNumber()).toBeCloseTo(100 - original.line.start.x.toNumber())
      expect(reflected.line.end.x.toNumber()).toBeCloseTo(100 - original.line.end.x.toNumber())
      expect(isPointInClosedPath(reflected.center, computed.components.rear.path)).toBe(true)
    }
    expect(getExportStitchLines(source, computed, computed.components.root, defaultStitchingSettings)).toHaveLength(1)
    expect(getExportStitchLines(source, computed, computed.components.small, defaultStitchingSettings)).toHaveLength(1)
  })
})
