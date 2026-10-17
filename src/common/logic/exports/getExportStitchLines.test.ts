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
