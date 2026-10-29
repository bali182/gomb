import { describe, expect, it } from 'vitest'

import { defaultStitchingSettings } from '../../defaultStates'
import type { ExportStitchLineModeSchema } from '../../schemas/settings'
import { d } from '../../testData'
import { getComputedSubProject } from '../getComputedSubProject'
import { isPointInClosedPath } from '../isPointInClosedPath'
import { getPathSegments } from '../pathSegments'
import { getPathSegmentMidpoint } from '../pathSegmentUtils'
import { getExportStitchLines } from './getExportStitchLines'

type StitchLineModeTestCase = {
  mode: ExportStitchLineModeSchema
  expectedIds: string[]
}

const stitchMargins: Record<string, number> = {
  'root-stitch': 4,
  'panel-stitch': 8,
  'child-stitch': 12,
}

describe.each<StitchLineModeTestCase>([
  { mode: 'own-stitch-lines', expectedIds: ['panel-stitch'] },
  { mode: 'related-stitch-lines', expectedIds: ['panel-stitch', 'child-stitch'] },
  { mode: 'all-stitch-lines', expectedIds: ['root-stitch', 'panel-stitch', 'child-stitch'] },
])('getExportStitchLines $mode', ({ mode, expectedIds }) => {
  it.each([false, true])('selects and clips stitches with a cutout: %s', (withCutout) => {
    const subProject = d.subProject({
      id: 'sub-project',
      root: d.rootPanel({ id: 'root', width: 100, height: 100, children: ['panel'] }),
      components: [d.panel({ id: 'panel', children: ['child'] }), d.panel({ id: 'child' })],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'root-stitch',
          targetId: 'root',
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

    if (target.type !== 'computed-panel') {
      throw new Error('Expected a computed panel')
    }

    const exported = getExportStitchLines(subProject, computed, target, mode, defaultStitchingSettings)

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
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 100, height: 120, children: ['cluster'] }),
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

  it.each<ExportStitchLineModeSchema>(['own-stitch-lines', 'related-stitch-lines'])(
    'exports only the matching pocket route even when the other route overlaps: %s',
    (mode) => {
      const source = fixture()
      const snapshot = structuredClone(source)
      const computed = getComputedSubProject(source, defaultStitchingSettings)
      const shared = computed.stitchLines.cluster[0]
      expect(shared.routes).toHaveLength(2)
      expect(shared.routes[0].path).toEqual(shared.routes[1].path)
      for (const id of ['a', 'b']) {
        const exported = getExportStitchLines(source, computed, computed.components[id], mode, defaultStitchingSettings)
        expect(exported.map(({ stitchLine }) => stitchLine.id).sort()).toEqual([`local-${id}`, 'shared'])
        const sharedExport = exported.find(({ stitchLine }) => stitchLine.id === 'shared')
        expect(sharedExport?.paths).toHaveLength(1)
        expect(sharedExport?.holes).toHaveLength(shared.routes[0].holes.length)
      }
      expect(getExportStitchLines(source, computed, computed.components.front, mode, defaultStitchingSettings)).toEqual(
        [],
      )
      expect(source).toEqual(snapshot)
    },
  )

  it('preserves all-route clipping in all mode and includes every route when exporting the root', () => {
    const source = fixture()
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const all = getExportStitchLines(
      source,
      computed,
      computed.components.a,
      'all-stitch-lines',
      defaultStitchingSettings,
    )
    expect(all.map(({ stitchLine }) => stitchLine.id).sort()).toEqual(['local-a', 'local-b', 'shared'])
    expect(all.find(({ stitchLine }) => stitchLine.id === 'shared')?.paths).toHaveLength(2)
    const related = getExportStitchLines(
      source,
      computed,
      computed.components.root,
      'related-stitch-lines',
      defaultStitchingSettings,
    )
    expect(related.find(({ stitchLine }) => stitchLine.id === 'shared')?.paths).toHaveLength(2)
  })
})
