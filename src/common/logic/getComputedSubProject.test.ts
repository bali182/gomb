import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import { defaultExportParams, defaultStitchingSettings } from '../defaultStates'
import type { AnchorSchema } from '../schemas/common'
import type {
  LayoutOrientationSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketOrientationSchema,
  RootPanelSchema,
} from '../schemas/components'
import type { ComputedComponentSchema } from '../schemas/computed'
import type { NumberCornerRadiusSchema, PathSchema } from '../schemas/geometry'
import type { HoleSchema } from '../schemas/hole'
import type { SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { translateExportElement } from './exports/exportGeometryUtils'
import { getExportElementsForComponent } from './exports/getExportElements'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'
import { getComputedSubProject } from './getComputedSubProject'
import { isPointInClosedPath } from './isPointInClosedPath'
import { getClosedPathLoops, getPathSegments } from './pathSegments'
import { getPathSegmentMidpoint } from './pathSegmentUtils'

type ExpectedBoundingRect = readonly [number, number, number, number]

type FixedLayoutTestCase = {
  rootPanel: Partial<RootPanelSchema>
  firstPanel: Partial<PanelSchema>
  secondPanel: Partial<PanelSchema>
  expectedFirstPanelBoundingRect: ExpectedBoundingRect
  expectedSecondPanelBoundingRect: ExpectedBoundingRect
}

type LayoutGapTestCase = {
  rootPanel: Partial<RootPanelSchema>
  expectedComputedLayoutGap: number
}

type OffAxisAnchorTestCase = {
  panel: Partial<PanelSchema>
  expectedCrossAxisPosition: number
}

type PocketClusterOffAxisAnchorTestCase = {
  pocketCluster: Partial<PocketClusterSchema>
  expectedCrossAxisPosition: number
}

type InwardStretchTestCase = {
  panel: Partial<PanelSchema>
  expectedBoundingRect: ExpectedBoundingRect
}

type OpposingStretchTestCase = {
  first: number
  second: number
  adjustedFirst: number
  adjustedSecond: number
  firstMinimum: number
  secondMinimum: number
  expectedSize: number
}

type SpaceDistributionTestCase = {
  name: string
  fixedSizes: number[]
  autoCount: number
  autoGap: boolean
  gap: number
  expectedGap: number
  expectedAutoSize: number
}

const expectBoundingRect = (component: ComputedComponentSchema, expected: ExpectedBoundingRect) => {
  expect([
    component.boundingRect.x.toNumber(),
    component.boundingRect.y.toNumber(),
    component.boundingRect.width.toNumber(),
    component.boundingRect.height.toNumber(),
  ]).toEqual(expected)
}

const getClosedPathArea = (path: PathSchema): number => {
  return getClosedPathLoops(path)
    .flat()
    .reduce((area, segment) => {
      if (segment.type === 'line') {
        return area + segment.start.x.times(segment.end.y).minus(segment.end.x.times(segment.start.y)).toNumber() / 2
      }
      return (
        area +
        (segment.center.x
          .times(segment.end.y.minus(segment.start.y))
          .minus(segment.center.y.times(segment.end.x.minus(segment.start.x)))
          .toNumber() +
          segment.radius.pow(2).toNumber() * segment.sweepAngle) /
          2
      )
    }, 0)
}

type PanelCutoutTestCase = {
  name: string
  holes: ExpectedBoundingRect[]
  removedArea: number
  highlightAreas: number[]
}

describe.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])(
  'self-intersecting pocket openings facing %s',
  (orientation) => {
    it.each([42, 51])('computes all pockets and subtracts holes with outer inset %s', (outerInset) => {
      const isVertical = orientation === 'up' || orientation === 'down'
      const root = d.rootPanel({
        id: 'root',
        width: isVertical ? 102.6 : 92.6,
        height: isVertical ? 92.6 : 102.6,
        children: ['cluster'],
      })
      const cluster = d.pocketCluster({
        id: 'cluster',
        orientation,
        pocketCount: 3,
        pocketStep: 10,
        topLeftRadius: 8,
        topRightRadius: 8,
        bottomLeftRadius: 8,
        bottomRightRadius: 8,
        defaultOpening: {
          id: 'own:default',
          name: 'Default',
          type: 'recessed',
          outerInset,
          innerOffset: 8,
          depth: 10,
          outerRadius: 55,
          innerRadius: 39,
        },
      })
      const subProject = d.subProject({ id: 'sub-project', root, components: [cluster] })
      const originalInput = JSON.stringify(subProject)
      const before = getComputedSubProject(subProject, defaultStitchingSettings)
      const beforeCluster = accessors.computedSubProject(before).pocketCluster(cluster.id)
      const openingLimits = accessors
        .subProjectLimits(before.limits)
        .optional.opening(cluster.id, cluster.defaultOpening.id)
      if (!isDefined(openingLimits)) {
        throw new Error('Expected opening limits')
      }
      const adjustedOpening = getAdjustedPocketOpening(cluster.defaultOpening, openingLimits)
      if (adjustedOpening.type !== 'recessed') {
        throw new Error('Expected recessed opening')
      }
      expect(beforeCluster.tPockets).toHaveLength(2)
      expect(getClosedPathArea(beforeCluster.path)).toBeGreaterThan(0)

      const hole: HoleSchema = {
        ...d.hole({ id: 'hole', componentId: cluster.id }),
        width: 6,
        height: 6,
        xAnchor: 'middle',
        yAnchor: 'middle',
        xOffset: 0,
        yOffset: 0,
      }
      const withHole = getComputedSubProject({ ...subProject, holes: [hole] }, defaultStitchingSettings)
      const afterCluster = accessors.computedSubProject(withHole).pocketCluster(cluster.id)
      expect(getClosedPathArea(beforeCluster.path) - getClosedPathArea(afterCluster.path)).toBeCloseTo(36, 6)
      expect(
        isPointInClosedPath(
          { x: new BigNumber(root.width / 2), y: new BigNumber(root.height / 2) },
          beforeCluster.path,
        ),
      ).toBe(true)
      expect(
        isPointInClosedPath({ x: new BigNumber(root.width / 2), y: new BigNumber(root.height / 2) }, afterCluster.path),
      ).toBe(false)
      for (const path of [
        afterCluster.path,
        afterCluster.frontPocket.path,
        ...afterCluster.tPockets.map((pocket) => pocket.path),
      ]) {
        expect(getClosedPathLoops(path).length).toBeGreaterThan(0)
        for (const segment of getClosedPathLoops(path).flat()) {
          expect(segment.start.x.isFinite() && segment.start.y.isFinite()).toBe(true)
          expect(segment.end.x.isFinite() && segment.end.y.isFinite()).toBe(true)
          if (segment.type === 'arc') {
            expect(
              [8, adjustedOpening.innerRadius, adjustedOpening.outerRadius].some(
                (radius) => Math.abs(segment.radius.toNumber() - radius) < 1e-7,
              ),
            ).toBe(true)
          }
        }
      }
      expect(JSON.stringify(subProject)).toBe(originalInput)
    })
  },
)

describe.each(['root-panel', 'panel'] as const)('getComputedSubProject %s cutouts', (ownerType) => {
  const ownerId = ownerType === 'root-panel' ? 'root' : 'panel'
  const otherId = ownerType === 'root-panel' ? 'panel' : 'root'
  const width = ownerType === 'root-panel' ? 160 : 100
  const height = ownerType === 'root-panel' ? 180 : 100
  const area = width * height
  const otherArea = ownerType === 'root-panel' ? 10000 : 28800

  const createFixture = (holes: HoleSchema[], radius = 0): SubProjectSchema => {
    const corners = {
      topLeftRadius: radius,
      topRightRadius: radius,
      bottomLeftRadius: radius,
      bottomRightRadius: radius,
    }
    return d.subProject({
      id: 'sub-project',
      root: d.rootPanel({
        id: 'root',
        width: 160,
        height: 180,
        children: ['panel'],
        ...(ownerType === 'root-panel' ? corners : {}),
      }),
      components: [
        d.panel({
          id: 'panel',
          width: 100,
          height: 100,
          autoWidth: false,
          autoHeight: false,
          ...(ownerType === 'panel' ? corners : {}),
        }),
      ],
      holes,
      stitchLines: [d.componentBoundsStitchLine({ id: 'stitch-line', targetId: ownerId, targetType: 'component' })],
    })
  }

  const createHole = (id: string, [x, y, holeWidth, holeHeight]: ExpectedBoundingRect, radius = 0): HoleSchema => {
    return {
      ...d.hole({ id, componentId: ownerId }),
      xAnchor: 'start',
      yAnchor: 'start',
      xOffset: x,
      yOffset: y,
      width: holeWidth,
      height: holeHeight,
      topLeftRadius: radius,
      topRightRadius: radius,
      bottomLeftRadius: radius,
      bottomRightRadius: radius,
    }
  }

  it.each<PanelCutoutTestCase>([
    { name: 'an internal hole', holes: [[20, 20, 20, 20]], removedArea: 400, highlightAreas: [400] },
    {
      name: 'overlapping holes',
      holes: [
        [20, 20, 20, 20],
        [30, 30, 20, 20],
      ],
      removedArea: 700,
      highlightAreas: [400, 400],
    },
    {
      name: 'a containing hole',
      holes: [
        [20, 20, 10, 10],
        [10, 10, 40, 40],
      ],
      removedArea: 1600,
      highlightAreas: [100, 1600],
    },
    {
      name: 'identical holes',
      holes: [
        [20, 20, 20, 20],
        [20, 20, 20, 20],
      ],
      removedArea: 400,
      highlightAreas: [400, 400],
    },
    { name: 'an external hole', holes: [[-40, 20, 20, 20]], removedArea: 0, highlightAreas: [0] },
    { name: 'a hole crossing the edge', holes: [[-10, 20, 30, 20]], removedArea: 400, highlightAreas: [400] },
  ])('computes $name and only cuts its owner', (testCase) => {
    const holes = testCase.holes.map((bounds, index) => createHole(`hole-${index}`, bounds))
    const computed = getComputedSubProject(createFixture(holes), defaultStitchingSettings)
    const owner = computed.components[ownerId]

    expect(owner.boundingRect.width.toNumber()).toBe(width)
    expect(owner.boundingRect.height.toNumber()).toBe(height)
    expect(getClosedPathArea(owner.path)).toBeCloseTo(area - testCase.removedArea, 7)
    expect(getClosedPathArea(computed.components[otherId].path)).toBeCloseTo(otherArea, 7)
    computed.holes.forEach((hole, index) => {
      expect(getClosedPathArea(hole.highlightPath)).toBeCloseTo(testCase.highlightAreas[index], 7)
    })
  })

  it('preserves the material island enclosed by several holes', () => {
    const bounds: ExpectedBoundingRect[] = [
      [10, 10, 80, 20],
      [10, 70, 80, 20],
      [10, 10, 20, 80],
      [70, 10, 20, 80],
    ]
    const holes = bounds.map((rectangle, index) => createHole(`hole-${index}`, rectangle))
    const computed = getComputedSubProject(createFixture(holes), defaultStitchingSettings)
    const owner = computed.components[ownerId]
    const islandCenter = { x: owner.boundingRect.x.plus(50), y: owner.boundingRect.y.plus(50) }
    expect(getClosedPathArea(owner.path)).toBeCloseTo(area - 4800, 7)
    expect(isPointInClosedPath(islandCenter, owner.path)).toBe(true)
    expect(isPointInClosedPath({ x: owner.boundingRect.x.plus(20), y: islandCenter.y }, owner.path)).toBe(false)
    expect(getClosedPathArea(computed.components[otherId].path)).toBeCloseTo(otherArea, 7)
    computed.holes.forEach((hole) => expect(getClosedPathArea(hole.highlightPath)).toBeCloseTo(1600, 7))
  })

  it('keeps both pieces when a hole splits the whole component', () => {
    const computed = getComputedSubProject(
      createFixture([createHole('split', [40, -10, 20, height + 20])]),
      defaultStitchingSettings,
    )
    const owner = computed.components[ownerId]
    expect(getClosedPathArea(owner.path)).toBeCloseTo(area - 20 * height, 7)
    expect(getClosedPathLoops(owner.path)).toHaveLength(2)
    for (const [x, inside] of [
      [20, true],
      [50, false],
      [80, true],
    ] as const) {
      expect(
        isPointInClosedPath({ x: owner.boundingRect.x.plus(x), y: owner.boundingRect.y.plus(50) }, owner.path),
      ).toBe(inside)
    }
  })

  it('clips the hole highlight against a rounded outer corner', () => {
    const computed = getComputedSubProject(
      createFixture([createHole('corner', [0, 0, 10, 10])], 10),
      defaultStitchingSettings,
    )
    const quarterCircle = (Math.PI * 100) / 4
    expect(getClosedPathArea(computed.holes[0].highlightPath)).toBeCloseTo(quarterCircle, 7)
    expect(getClosedPathArea(computed.components[ownerId].path)).toBeCloseTo(
      area - (4 - Math.PI) * 100 - quarterCircle,
      7,
    )
    expect(getClosedPathArea(computed.components[otherId].path)).toBeCloseTo(otherArea, 7)
  })

  it('allows a hole to remove the whole component', () => {
    const computed = getComputedSubProject(
      createFixture([createHole('cover', [-10, -10, width + 20, height + 20])]),
      defaultStitchingSettings,
    )
    expect(computed.components[ownerId].path.commands).toEqual([])
    expect(getClosedPathArea(computed.holes[0].highlightPath)).toBeCloseTo(area, 7)
    expect(getClosedPathArea(computed.components[otherId].path)).toBeCloseTo(otherArea, 7)
  })

  it.each(['start', 'middle', 'end'] as const)('places and cuts %s-anchored holes in owner coordinates', (xAnchor) => {
    const hole = { ...createHole('anchored', [10, 10, 20, 10]), xAnchor, yAnchor: 'end' as const }
    const computed = getComputedSubProject(createFixture([hole]), defaultStitchingSettings)
    const owner = computed.components[ownerId]
    const localX = xAnchor === 'start' ? 10 : xAnchor === 'middle' ? width / 2 : width - 30
    expect(computed.holes[0].boundingRect.x.toNumber()).toBe(owner.boundingRect.x.plus(localX).toNumber())
    expect(computed.holes[0].boundingRect.y.toNumber()).toBe(owner.boundingRect.y.plus(height - 20).toNumber())
    expect(getClosedPathArea(owner.path)).toBeCloseTo(area - 200, 7)
    expect(getClosedPathArea(computed.holes[0].highlightPath)).toBeCloseTo(200, 7)
  })

  it.each(['svg', 'pdf', 'png'] as const)('passes the cut contour and clipped stitches to %s export', (format) => {
    const subProject = createFixture(
      [createHole('circle', [40, 40, 30, 30], 15), createHole('notch', [30, 0, 20, 20])],
      10,
    )
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const elements = getExportElementsForComponent(
      subProject,
      computed,
      ownerId,
      { ...defaultExportParams, format },
      defaultStitchingSettings,
    )
    const exported = elements.find((element) => element.id === ownerId)
    if (!isDefined(exported) || exported.type !== 'export-panel') {
      throw new Error('Expected the owner panel in export')
    }
    const expectedArea = area - (4 - Math.PI) * 100 - Math.PI * 225 - 400
    expect(getClosedPathArea(exported.path)).toBeCloseTo(expectedArea, 7)
    expect(exported.stitchLines).toHaveLength(1)
    const stitchHoles = exported.stitchLines.flatMap((stitchLine) => stitchLine.holes)
    expect(stitchHoles.length).toBeGreaterThan(0)
    stitchHoles.forEach((hole) => expect(isPointInClosedPath(hole.center, exported.path)).toBe(true))
    const stitchPaths = exported.stitchLines.flatMap((stitchLine) => stitchLine.paths)
    expect(stitchPaths.length).toBeGreaterThan(0)
    stitchPaths
      .flatMap((path) => getPathSegments(path))
      .forEach((segment) => {
        expect(isPointInClosedPath(getPathSegmentMidpoint(segment), exported.path)).toBe(true)
      })

    const translated = translateExportElement(exported, { x: new BigNumber(250), y: new BigNumber(-75) })
    if (translated.type !== 'export-panel') {
      throw new Error('Expected a translated panel')
    }
    expect(getClosedPathArea(translated.path)).toBeCloseTo(expectedArea, 7)
    translated.stitchLines
      .flatMap((stitchLine) => stitchLine.holes)
      .forEach((hole) => {
        expect(isPointInClosedPath(hole.center, translated.path)).toBe(true)
      })
  })
})

describe('getComputedSubProject layout', () => {
  it.each<FixedLayoutTestCase>([
    {
      rootPanel: { width: 100, height: 60, layoutOrientation: 'horizontal' },
      firstPanel: { width: 20, autoWidth: false },
      secondPanel: { width: 20, autoWidth: false },
      expectedFirstPanelBoundingRect: [0, 0, 20, 60],
      expectedSecondPanelBoundingRect: [30, 0, 20, 60],
    },
    {
      rootPanel: { width: 60, height: 100, layoutOrientation: 'vertical' },
      firstPanel: { height: 20, autoHeight: false },
      secondPanel: { height: 20, autoHeight: false },
      expectedFirstPanelBoundingRect: [0, 0, 60, 20],
      expectedSecondPanelBoundingRect: [0, 30, 60, 20],
    },
  ])('positions fixed children with a manual gap', (testCase) => {
    const root = d.rootPanel({
      id: 'root',
      ...testCase.rootPanel,
      layoutGap: 10,
      children: ['first', 'second'],
    })
    const first = d.panel({ id: 'first', ...testCase.firstPanel })
    const second = d.panel({ id: 'second', ...testCase.secondPanel })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [first, second] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(10)
    expectBoundingRect(computed.panel(first.id), testCase.expectedFirstPanelBoundingRect)
    expectBoundingRect(computed.panel(second.id), testCase.expectedSecondPanelBoundingRect)
  })

  it.each<FixedLayoutTestCase>([
    {
      rootPanel: { width: 100, height: 40, layoutOrientation: 'horizontal' },
      firstPanel: { width: 20, autoWidth: false },
      secondPanel: { width: 20, autoWidth: false },
      expectedFirstPanelBoundingRect: [0, 0, 20, 40],
      expectedSecondPanelBoundingRect: [80, 0, 20, 40],
    },
    {
      rootPanel: { width: 40, height: 100, layoutOrientation: 'vertical' },
      firstPanel: { height: 20, autoHeight: false },
      secondPanel: { height: 20, autoHeight: false },
      expectedFirstPanelBoundingRect: [0, 0, 40, 20],
      expectedSecondPanelBoundingRect: [0, 80, 40, 20],
    },
  ])('positions fixed children with an automatic gap', (testCase) => {
    const root = d.rootPanel({
      id: 'root',
      ...testCase.rootPanel,
      autoLayoutGap: true,
      children: ['first', 'second'],
    })
    const first = d.panel({ id: 'first', ...testCase.firstPanel })
    const second = d.panel({ id: 'second', ...testCase.secondPanel })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [first, second] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(60)
    expectBoundingRect(computed.panel(first.id), testCase.expectedFirstPanelBoundingRect)
    expectBoundingRect(computed.panel(second.id), testCase.expectedSecondPanelBoundingRect)
  })

  it('shares automatic space between a gap and an auto-sized child', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      autoLayoutGap: true,
      children: ['fixed', 'auto'],
    })
    const fixed = d.panel({ id: 'fixed', width: 20, autoWidth: false })
    const auto = d.panel({ id: 'auto' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [fixed, auto] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(40)
    expectBoundingRect(computed.panel(fixed.id), [0, 0, 20, 40])
    expectBoundingRect(computed.panel(auto.id), [60, 0, 40, 40])
  })

  it('shares automatic space between auto-sized children and their gap', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 90,
      height: 40,
      autoLayoutGap: true,
      children: ['first', 'second'],
    })
    const first = d.panel({ id: 'first' })
    const second = d.panel({ id: 'second' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [first, second] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(30)
    expectBoundingRect(computed.panel(first.id), [0, 0, 30, 40])
    expectBoundingRect(computed.panel(second.id), [60, 0, 30, 40])
  })

  it('uses the manual gap when sizing an auto-sized child', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      layoutGap: 10,
      children: ['fixed', 'auto'],
    })
    const fixed = d.panel({ id: 'fixed', width: 20, autoWidth: false })
    const auto = d.panel({ id: 'auto' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [fixed, auto] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(fixed.id), [0, 0, 20, 40])
    expectBoundingRect(computed.panel(auto.id), [30, 0, 70, 40])
  })

  it('does not allocate negative size when a manual gap uses all remaining space', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      layoutGap: 80,
      children: ['fixed', 'auto'],
    })
    const fixed = d.panel({ id: 'fixed', width: 20, autoWidth: false })
    const auto = d.panel({ id: 'auto' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [fixed, auto] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(auto.id), [100, 0, 0, 40])
  })

  it('preserves fixed main-axis and cross-axis sizes beyond the parent bounds', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 60,
      children: ['wide', 'tall'],
    })
    const wide = d.panel({
      id: 'wide',
      width: 200,
      autoWidth: false,
      height: 20,
      autoHeight: false,
      offAxisAnchor: 'start',
    })
    const tall = d.panel({
      id: 'tall',
      width: 20,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      offAxisAnchor: 'end',
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [wide, tall] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(wide.id), [0, 0, 200, 20])
    expectBoundingRect(computed.panel(tall.id), [200, -40, 20, 100])
  })

  it.each<LayoutGapTestCase>([
    { rootPanel: { autoLayoutGap: false, layoutGap: 10 }, expectedComputedLayoutGap: 10 },
    { rootPanel: { autoLayoutGap: true, layoutGap: 10 }, expectedComputedLayoutGap: 0 },
  ])('handles an empty layout', (testCase) => {
    const root = d.rootPanel({ id: 'root', ...testCase.rootPanel, children: [] })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root }), defaultStitchingSettings),
    )

    expect(computed.rootPanel().children).toEqual([])
    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(testCase.expectedComputedLayoutGap)
  })

  it.each<LayoutGapTestCase>([
    { rootPanel: { autoLayoutGap: false, layoutGap: 10 }, expectedComputedLayoutGap: 10 },
    { rootPanel: { autoLayoutGap: true, layoutGap: 10 }, expectedComputedLayoutGap: 100 },
  ])('handles a single auto-sized child', (testCase) => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 40, ...testCase.rootPanel, children: ['child'] })
    const child = d.panel({ id: 'child' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expect(computed.rootPanel().computedLayoutGap.toNumber()).toBe(testCase.expectedComputedLayoutGap)
    expectBoundingRect(computed.panel(child.id), [0, 0, 100, 40])
  })

  it('retains source order and associates bounding boxes with component IDs', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      layoutGap: 10,
      children: ['zeta', 'alpha'],
    })
    const zeta = d.panel({ id: 'zeta', width: 30, autoWidth: false })
    const alpha = d.pocketCluster({ id: 'alpha', width: 20, autoWidth: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [zeta, alpha] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.rootPanel().children.map((child) => child.componentId)).toEqual(['zeta', 'alpha'])
    expectBoundingRect(computed.panel(zeta.id), [0, 0, 30, 40])
    expectBoundingRect(computed.pocketCluster(alpha.id), [40, 0, 20, 40])
  })

  it('uses a nested panel layout instead of its parent layout', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['container'] })
    const container = d.panel({
      id: 'container',
      width: 100,
      autoWidth: false,
      layoutOrientation: 'vertical',
      layoutGap: 5,
      children: ['top', 'bottom'],
    })
    const top = d.panel({ id: 'top', height: 20, autoHeight: false })
    const bottom = d.panel({ id: 'bottom', height: 30, autoHeight: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [container, top, bottom] }),
        defaultStitchingSettings,
      ),
    )

    expect(computed.panel(container.id).computedLayoutGap.toNumber()).toBe(5)
    expectBoundingRect(computed.panel(container.id), [0, 0, 100, 100])
    expectBoundingRect(computed.panel(top.id), [0, 0, 100, 20])
    expectBoundingRect(computed.panel(bottom.id), [0, 25, 100, 30])
  })

  it('uses each panel layout when layouts are nested multiple levels deep', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['outer'] })
    const outer = d.panel({
      id: 'outer',
      width: 100,
      autoWidth: false,
      layoutOrientation: 'vertical',
      layoutGap: 10,
      children: ['inner'],
    })
    const inner = d.panel({
      id: 'inner',
      height: 50,
      autoHeight: false,
      layoutOrientation: 'horizontal',
      layoutGap: 5,
      children: ['left', 'right'],
    })
    const left = d.panel({ id: 'left', width: 20, autoWidth: false })
    const right = d.panel({ id: 'right', width: 30, autoWidth: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [outer, inner, left, right] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(inner.id), [0, 0, 100, 50])
    expectBoundingRect(computed.panel(left.id), [0, 0, 20, 50])
    expectBoundingRect(computed.panel(right.id), [25, 0, 30, 50])
  })

  it('rejects a root panel as a layout child', () => {
    const root = d.rootPanel({ id: 'root', children: ['root'] })
    const subProject = d.subProject({ id: 'sub-project', root })
    expect(() => getComputedSubProject(subProject, defaultStitchingSettings)).toThrow(
      'Unsupported child component type: root-panel',
    )
  })

  it.each<OffAxisAnchorTestCase>([
    { panel: { offAxisAnchor: 'start' }, expectedCrossAxisPosition: 0 },
    { panel: { offAxisAnchor: 'middle' }, expectedCrossAxisPosition: 20 },
    { panel: { offAxisAnchor: 'end' }, expectedCrossAxisPosition: 40 },
  ])('positions a fixed-height horizontal child', (testCase) => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 100,
      children: ['child'],
    })
    const child = d.panel({ id: 'child', height: 60, autoHeight: false, ...testCase.panel })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, testCase.expectedCrossAxisPosition, 100, 60])
  })

  it.each<OffAxisAnchorTestCase>([
    { panel: { offAxisAnchor: 'start' }, expectedCrossAxisPosition: 0 },
    { panel: { offAxisAnchor: 'middle' }, expectedCrossAxisPosition: 20 },
    { panel: { offAxisAnchor: 'end' }, expectedCrossAxisPosition: 40 },
  ])('positions a fixed-width vertical child', (testCase) => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 100,
      layoutOrientation: 'vertical',
      children: ['child'],
    })
    const child = d.panel({ id: 'child', width: 60, autoWidth: false, ...testCase.panel })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [testCase.expectedCrossAxisPosition, 0, 60, 100])
  })

  it.each<OffAxisAnchorTestCase>([
    { panel: { offAxisAnchor: 'start' }, expectedCrossAxisPosition: 0 },
    { panel: { offAxisAnchor: 'middle' }, expectedCrossAxisPosition: 0 },
    { panel: { offAxisAnchor: 'end' }, expectedCrossAxisPosition: 0 },
  ])('does not offset an auto-height horizontal child', (testCase) => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 100,
      children: ['child'],
    })
    const child = d.panel({ id: 'child', ...testCase.panel })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, testCase.expectedCrossAxisPosition, 100, 100])
  })

  it('uses a nested panel off-axis anchor', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['container'] })
    const container = d.panel({
      id: 'container',
      width: 100,
      autoWidth: false,
      children: ['child'],
    })
    const child = d.panel({ id: 'child', height: 60, autoHeight: false, offAxisAnchor: 'end' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [container, child] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(child.id), [0, 40, 100, 60])
  })

  it('uses the full cross-axis size to position an oversized fixed child', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 60,
      children: ['child'],
    })
    const child = d.panel({ id: 'child', height: 100, autoHeight: false, offAxisAnchor: 'end' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, -40, 100, 100])
  })

  it.each<PocketClusterOffAxisAnchorTestCase>([
    { pocketCluster: { offAxisAnchor: 'start' }, expectedCrossAxisPosition: 0 },
    { pocketCluster: { offAxisAnchor: 'middle' }, expectedCrossAxisPosition: 20 },
    { pocketCluster: { offAxisAnchor: 'end' }, expectedCrossAxisPosition: 40 },
  ])('positions a fixed-height pocket cluster', (testCase) => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({ id: 'cluster', height: 60, autoHeight: false, ...testCase.pocketCluster })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [cluster] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.pocketCluster(cluster.id), [0, testCase.expectedCrossAxisPosition, 100, 60])
  })

  it.each<InwardStretchTestCase>([
    { panel: { topStretch: -10 }, expectedBoundingRect: [0, 10, 60, 50] },
    { panel: { rightStretch: -10 }, expectedBoundingRect: [0, 0, 50, 60] },
    { panel: { bottomStretch: -10 }, expectedBoundingRect: [0, 0, 60, 50] },
    { panel: { leftStretch: -10 }, expectedBoundingRect: [10, 0, 50, 60] },
  ])('moves each panel edge inward with negative stretch', (testCase) => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['child'] })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'start',
      ...testCase.panel,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), testCase.expectedBoundingRect)
  })

  it('allows opposing negative stretch to reduce the component to zero', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['child'] })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'start',
      topStretch: -100,
      rightStretch: -100,
      bottomStretch: -100,
      leftStretch: -100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [30, 30, 0, 0])
  })

  it('allows positive vertical stretch beyond the parent bounds', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['child'] })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'middle',
      topStretch: 100,
      bottomStretch: 100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, -80, 60, 260])
  })

  it('allows positive horizontal stretch beyond the parent bounds', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 100,
      layoutOrientation: 'vertical',
      children: ['child'],
    })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'middle',
      rightStretch: 100,
      leftStretch: 100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [-80, 0, 260, 60])
  })

  it('does not use a stretched bounding box to position the next sibling', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      layoutGap: 10,
      children: ['first', 'second'],
    })
    const first = d.panel({ id: 'first', width: 20, autoWidth: false, rightStretch: 100 })
    const second = d.panel({ id: 'second', width: 20, autoWidth: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [first, second] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(first.id), [0, 0, 120, 40])
    expectBoundingRect(computed.panel(second.id), [30, 0, 20, 40])
  })

  it('applies stretch to pocket clusters', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'middle',
      topStretch: -10,
      bottomStretch: -20,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [cluster] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.pocketCluster(cluster.id), [0, 30, 100, 30])
  })

  it.each<{
    orientation: PocketOrientationSchema
    expectedChildBoundingRect: ExpectedBoundingRect
  }>([
    { orientation: 'up', expectedChildBoundingRect: [0, 20, 20, 20] },
    { orientation: 'down', expectedChildBoundingRect: [0, 0, 20, 20] },
    { orientation: 'left', expectedChildBoundingRect: [20, 0, 20, 20] },
    { orientation: 'right', expectedChildBoundingRect: [0, 0, 20, 20] },
  ])('lays out children in the $orientation front pocket', ({ orientation, expectedChildBoundingRect }) => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      children: ['child'],
      orientation,
      pocketCount: 3,
      pocketStep: 10,
    })
    const child = d.panel({
      id: 'child',
      width: 20,
      autoWidth: false,
      height: 20,
      autoHeight: false,
      offAxisAnchor: 'start',
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [cluster, child] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(child.id), expectedChildBoundingRect)
  })

  it('uses the cluster layout direction and gap inside its front pocket', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      children: ['first', 'second'],
      layoutOrientation: 'vertical',
      layoutGap: 10,
      orientation: 'up',
      pocketCount: 3,
      pocketStep: 10,
    })
    const first = d.panel({ id: 'first', width: 20, autoWidth: false, height: 20, autoHeight: false })
    const second = d.panel({ id: 'second', width: 20, autoWidth: false, height: 20, autoHeight: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [cluster, first, second] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(first.id), [40, 20, 20, 20])
    expectBoundingRect(computed.panel(second.id), [40, 50, 20, 20])
  })

  it('uses the front pocket size to distribute auto-sized children', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      children: ['first', 'second'],
      layoutGap: 10,
      orientation: 'up',
      pocketCount: 3,
      pocketStep: 10,
    })
    const first = d.panel({ id: 'first' })
    const second = d.panel({ id: 'second' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [cluster, first, second] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(first.id), [0, 20, 45, 80])
    expectBoundingRect(computed.panel(second.id), [55, 20, 45, 80])
  })

  it('computes nested children below a pocket cluster', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      children: ['nested-cluster'],
      orientation: 'up',
      pocketCount: 3,
      pocketStep: 10,
    })
    const nestedCluster = d.pocketCluster({
      id: 'nested-cluster',
      children: ['child'],
      pocketCount: 3,
      pocketStep: 10,
    })
    const child = d.panel({ id: 'child' })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [cluster, nestedCluster, child] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.pocketCluster(nestedCluster.id), [0, 20, 100, 80])
    expectBoundingRect(computed.panel(child.id), [0, 40, 100, 60])
  })

  it.each<{
    orientation: PocketOrientationSchema
    expectedCornerRadius: NumberCornerRadiusSchema
  }>([
    { orientation: 'up', expectedCornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 13, bottomRight: 14 } },
    { orientation: 'down', expectedCornerRadius: { topLeft: 11, topRight: 12, bottomLeft: 0, bottomRight: 0 } },
    { orientation: 'left', expectedCornerRadius: { topLeft: 0, topRight: 12, bottomLeft: 0, bottomRight: 14 } },
    { orientation: 'right', expectedCornerRadius: { topLeft: 11, topRight: 0, bottomLeft: 13, bottomRight: 0 } },
  ])('inherits outer cluster radii in the $orientation front pocket', ({ orientation, expectedCornerRadius }) => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      children: ['child'],
      orientation,
      pocketCount: 3,
      pocketStep: 20,
      topLeftRadius: 11,
      topRightRadius: 12,
      bottomLeftRadius: 13,
      bottomRightRadius: 14,
      individualRadii: true,
    })
    const child = d.panel({ id: 'child', individualRadii: true })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [cluster, child] }),
        defaultStitchingSettings,
      ),
    )
    const computedChild = computed.panel(child.id)

    expect({
      topLeft: computedChild.cornerRadius.topLeft.toNumber(),
      topRight: computedChild.cornerRadius.topRight.toNumber(),
      bottomLeft: computedChild.cornerRadius.bottomLeft.toNumber(),
      bottomRight: computedChild.cornerRadius.bottomRight.toNumber(),
    }).toEqual(expectedCornerRadius)
  })

  it('patches a pocket cluster auto layout gap from its front pocket', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      width: 100,
      autoWidth: false,
      height: 100,
      autoHeight: false,
      autoLayoutGap: true,
      children: ['first', 'second'],
      orientation: 'up',
      pocketCount: 3,
      pocketStep: 10,
    })
    const first = d.panel({ id: 'first', width: 20, autoWidth: false })
    const second = d.panel({ id: 'second', width: 20, autoWidth: false })
    const subProject = d.subProject({ id: 'sub-project', root, components: [cluster, first, second] })
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)

    const patched = getPatchedSubProject(subProject, computed)

    expect(patched.components.cluster.layoutGap).toBe(60)
  })
})

describe.each<LayoutOrientationSchema>(['horizontal', 'vertical'])(
  'layout overflow and stretch: %s',
  (layoutOrientation) => {
    const isHorizontal = layoutOrientation === 'horizontal'

    describe.each(['panel', 'pocket-cluster'] as const)('%s children', (type) => {
      it.each<SpaceDistributionTestCase>([
        {
          name: 'empty layout',
          fixedSizes: [],
          autoCount: 0,
          autoGap: true,
          gap: 30,
          expectedGap: 0,
          expectedAutoSize: 0,
        },
        {
          name: 'manual gaps and fixed children',
          fixedSizes: [20, 30],
          autoCount: 0,
          autoGap: false,
          gap: 10,
          expectedGap: 10,
          expectedAutoSize: 0,
        },
        {
          name: 'one auto child and one auto gap',
          fixedSizes: [20],
          autoCount: 1,
          autoGap: true,
          gap: 0,
          expectedGap: 40,
          expectedAutoSize: 40,
        },
        {
          name: 'several auto children and gaps',
          fixedSizes: [20],
          autoCount: 2,
          autoGap: true,
          gap: 0,
          expectedGap: 20,
          expectedAutoSize: 20,
        },
        {
          name: 'one oversized fixed child',
          fixedSizes: [120],
          autoCount: 2,
          autoGap: true,
          gap: 0,
          expectedGap: 0,
          expectedAutoSize: 0,
        },
        {
          name: 'several fixed children overflowing together',
          fixedSizes: [70, 70],
          autoCount: 1,
          autoGap: false,
          gap: 10,
          expectedGap: 10,
          expectedAutoSize: 0,
        },
        {
          name: 'exactly full fixed space',
          fixedSizes: [100],
          autoCount: 1,
          autoGap: false,
          gap: 0,
          expectedGap: 0,
          expectedAutoSize: 0,
        },
        {
          name: 'manual gaps consuming all remaining space',
          fixedSizes: [20],
          autoCount: 1,
          autoGap: false,
          gap: 80,
          expectedGap: 80,
          expectedAutoSize: 0,
        },
        {
          name: 'manual gaps exceeding the parent',
          fixedSizes: [20],
          autoCount: 2,
          autoGap: false,
          gap: 100,
          expectedGap: 100,
          expectedAutoSize: 0,
        },
        {
          name: 'shared space after manual gaps',
          fixedSizes: [20],
          autoCount: 2,
          autoGap: false,
          gap: 10,
          expectedGap: 10,
          expectedAutoSize: 30,
        },
        {
          name: 'auto children filling without gaps',
          fixedSizes: [],
          autoCount: 2,
          autoGap: false,
          gap: 0,
          expectedGap: 0,
          expectedAutoSize: 50,
        },
        {
          name: 'fixed children sharing the auto gap',
          fixedSizes: [20, 30],
          autoCount: 0,
          autoGap: true,
          gap: 0,
          expectedGap: 50,
          expectedAutoSize: 0,
        },
      ])('$name', ({ fixedSizes, autoCount, autoGap, gap, expectedGap, expectedAutoSize }) => {
        const fixed = fixedSizes.map((size, index) => {
          const config = {
            id: 'fixed-' + index,
            width: isHorizontal ? size : 60,
            height: isHorizontal ? 60 : size,
            autoWidth: false,
            autoHeight: false,
          }
          return type === 'panel' ? d.panel(config) : d.pocketCluster(config)
        })
        const automatic = Array.from({ length: autoCount }, (_, index) =>
          type === 'panel' ? d.panel({ id: 'auto-' + index }) : d.pocketCluster({ id: 'auto-' + index }),
        )
        const children = [...fixed, ...automatic]
        const root = d.rootPanel({
          id: 'root',
          width: isHorizontal ? 100 : 60,
          height: isHorizontal ? 60 : 100,
          layoutOrientation,
          layoutGap: gap,
          autoLayoutGap: autoGap,
          children: children.map((child) => child.id),
        })
        const source = d.subProject({ id: 'sub-project', root, components: children })
        const snapshot = structuredClone(source)
        const computed = getComputedSubProject(source, defaultStitchingSettings)
        expect(computed.components[root.id].computedLayoutGap.toNumber()).toBe(expectedGap)
        let position = 0
        for (const [index, child] of children.entries()) {
          const size = index < fixed.length ? fixedSizes[index] : expectedAutoSize
          const bounds = computed.components[child.id].boundingRect
          expect(bounds.x.toNumber()).toBeCloseTo(isHorizontal ? position : 0, 10)
          expect(bounds.y.toNumber()).toBeCloseTo(isHorizontal ? 0 : position, 10)
          expect(bounds.width.toNumber()).toBeCloseTo(isHorizontal ? size : 60, 10)
          expect(bounds.height.toNumber()).toBeCloseTo(isHorizontal ? 60 : size, 10)
          position += size + expectedGap
        }
        expect(source).toEqual(snapshot)
      })

      it.each<AnchorSchema>(['start', 'middle', 'end'])('anchors an oversized child at %s', (offAxisAnchor) => {
        const root = d.rootPanel({
          id: 'root',
          width: isHorizontal ? 100 : 60,
          height: isHorizontal ? 60 : 100,
          layoutOrientation,
          children: ['child'],
        })
        const config = {
          id: 'child',
          width: isHorizontal ? 130 : 100,
          height: isHorizontal ? 100 : 130,
          autoWidth: false,
          autoHeight: false,
          offAxisAnchor,
        }
        const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
        const computed = getComputedSubProject(
          d.subProject({
            id: 'sub-project',
            root,
            components: [child],
          }),
          defaultStitchingSettings,
        )
        const crossPosition = { start: 0, middle: -20, end: -40 }[offAxisAnchor]
        expectBoundingRect(
          computed.components[child.id],
          isHorizontal ? [0, crossPosition, 130, 100] : [crossPosition, 0, 100, 130],
        )
      })

      it.each([
        { size: 0, stretch: -100, expectedSize: 0, inset: 0 },
        { size: 0.5, stretch: -100, expectedSize: 0, inset: 0.25 },
        { size: 1, stretch: -100, expectedSize: 0, inset: 0.5 },
        { size: 10, stretch: -100, expectedSize: 0, inset: 5 },
        { size: 0, stretch: 5, expectedSize: 10, inset: -5 },
        { size: 10, stretch: 0, expectedSize: 10, inset: 0 },
        { size: 10, stretch: 100, expectedSize: 210, inset: -100 },
      ])('applies stretch $stretch to a $size mm child', ({ size, stretch, expectedSize, inset }) => {
        const root = d.rootPanel({ id: 'root', children: ['child'], layoutOrientation })
        const config = {
          id: 'child',
          width: size,
          height: size,
          autoWidth: false,
          autoHeight: false,
          offAxisAnchor: 'start' as const,
          topStretch: stretch,
          rightStretch: stretch,
          bottomStretch: stretch,
          leftStretch: stretch,
        }
        const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
        const computed = getComputedSubProject(
          d.subProject({
            id: 'sub-project',
            root,
            components: [child],
          }),
          defaultStitchingSettings,
        )
        expectBoundingRect(computed.components[child.id], [inset, inset, expectedSize, expectedSize])
        const computedAccessor = accessors.computedSubProject(computed)
        const bounds = (type === 'panel' ? computedAccessor.panel(child.id) : computedAccessor.pocketCluster(child.id))
          .layoutBoundingRect
        expect(bounds.width.toNumber()).toBe(size)
        expect(bounds.height.toNumber()).toBe(size)
      })

      it('applies asymmetric stretch after alignment without moving siblings', () => {
        const root = d.rootPanel({
          id: 'root',
          width: 100,
          height: 100,
          layoutOrientation,
          layoutGap: 10,
          children: ['child', 'sibling'],
        })
        const config = {
          id: 'child',
          width: 40,
          height: 40,
          autoWidth: false,
          autoHeight: false,
          offAxisAnchor: 'middle' as const,
          leftStretch: 7,
          rightStretch: -3,
          topStretch: -4,
          bottomStretch: 6,
        }
        const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
        const sibling = d.panel({ id: 'sibling', width: 20, height: 20, autoWidth: false, autoHeight: false })
        const computed = getComputedSubProject(
          d.subProject({
            id: 'sub-project',
            root,
            components: [child, sibling],
          }),
          defaultStitchingSettings,
        )
        expectBoundingRect(computed.components[child.id], isHorizontal ? [-7, 34, 44, 42] : [23, 4, 44, 42])
        expectBoundingRect(computed.components[sibling.id], isHorizontal ? [50, 40, 20, 20] : [40, 50, 20, 20])
      })
    })

    it('keeps nested zero-sized panels and pocket clusters computable', () => {
      const root = d.rootPanel({
        id: 'root',
        width: 100,
        height: 100,
        layoutOrientation,
        children: ['fixed', 'container'],
      })
      const fixed = d.panel({ id: 'fixed', width: 120, height: 120, autoWidth: false, autoHeight: false })
      const container = d.panel({
        id: 'container',
        layoutOrientation: isHorizontal ? 'vertical' : 'horizontal',
        children: ['nested-fixed', 'nested-panel', 'cluster'],
      })
      const nestedFixed = d.panel({ id: 'nested-fixed', width: 100, height: 100, autoWidth: false, autoHeight: false })
      const nestedPanel = d.panel({ id: 'nested-panel' })
      const cluster = d.pocketCluster({ id: 'cluster' })
      const computed = getComputedSubProject(
        d.subProject({
          id: 'sub-project',
          root,
          components: [fixed, container, nestedFixed, nestedPanel, cluster],
        }),
        defaultStitchingSettings,
      )
      const parent = computed.components[container.id].boundingRect
      for (const child of [nestedPanel, cluster]) {
        const bounds = computed.components[child.id].boundingRect
        expect(bounds.width.toNumber()).toBe(0)
        expect(bounds.height.toNumber()).toBe(0)
        expect(bounds.x.isFinite() && bounds.y.isFinite()).toBe(true)
        expect(bounds.x.gte(parent.x) && bounds.y.gte(parent.y)).toBe(true)
      }
    })
  },
)

describe.each(['panel', 'pocket-cluster'] as const)('opposing stretch on %s', (type) => {
  describe.each<LayoutOrientationSchema>(['horizontal', 'vertical'])('%s axis', (axis) => {
    it.each<OpposingStretchTestCase>([
      {
        first: -80,
        second: -20,
        adjustedFirst: -80,
        adjustedSecond: -20,
        firstMinimum: -80,
        secondMinimum: -50,
        expectedSize: 0,
      },
      {
        first: -80,
        second: -30,
        adjustedFirst: -70,
        adjustedSecond: -30,
        firstMinimum: -70,
        secondMinimum: -50,
        expectedSize: 0,
      },
      {
        first: -30,
        second: -80,
        adjustedFirst: -30,
        adjustedSecond: -70,
        firstMinimum: -50,
        secondMinimum: -70,
        expectedSize: 0,
      },
      {
        first: -80,
        second: -80,
        adjustedFirst: -50,
        adjustedSecond: -50,
        firstMinimum: -50,
        secondMinimum: -50,
        expectedSize: 0,
      },
      {
        first: -120,
        second: 0,
        adjustedFirst: -100,
        adjustedSecond: 0,
        firstMinimum: -100,
        secondMinimum: -50,
        expectedSize: 0,
      },
      {
        first: 30,
        second: -120,
        adjustedFirst: 30,
        adjustedSecond: -120,
        firstMinimum: -50,
        secondMinimum: -130,
        expectedSize: 10,
      },
      {
        first: 30,
        second: -140,
        adjustedFirst: 30,
        adjustedSecond: -130,
        firstMinimum: -50,
        secondMinimum: -130,
        expectedSize: 0,
      },
      {
        first: 30,
        second: 40,
        adjustedFirst: 30,
        adjustedSecond: 40,
        firstMinimum: -140,
        secondMinimum: -130,
        expectedSize: 170,
      },
    ])(
      'calculates geometry and original-layout limits for $first / $second',
      ({ first, second, adjustedFirst, adjustedSecond, firstMinimum, secondMinimum, expectedSize }) => {
        const horizontal = axis === 'horizontal'
        const firstField = horizontal ? 'leftStretch' : 'topStretch'
        const secondField = horizontal ? 'rightStretch' : 'bottomStretch'
        const root = d.rootPanel({
          id: 'root',
          width: 200,
          height: 200,
          children: ['child', 'sibling'],
          layoutOrientation: axis,
          layoutGap: 10,
        })
        const config = {
          id: 'child',
          width: horizontal ? 100 : 60,
          height: horizontal ? 60 : 100,
          autoWidth: false,
          autoHeight: false,
          offAxisAnchor: 'start' as const,
          [firstField]: first,
          [secondField]: second,
        }
        const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
        const sibling = d.panel({
          id: 'sibling',
          width: 20,
          height: 20,
          autoWidth: false,
          autoHeight: false,
          offAxisAnchor: 'start',
        })
        const source = d.subProject({ id: 'sub-project', root, components: [child, sibling] })
        const snapshot = structuredClone(source)
        const computed = getComputedSubProject(source, defaultStitchingSettings)
        const computedAccessor = accessors.computedSubProject(computed)
        const result = type === 'panel' ? computedAccessor.panel(child.id) : computedAccessor.pocketCluster(child.id)
        expectBoundingRect(
          result,
          horizontal ? [-adjustedFirst, 0, expectedSize, 60] : [0, -adjustedFirst, 60, expectedSize],
        )
        expect(result.layoutBoundingRect.width.toNumber()).toBe(horizontal ? 100 : 60)
        expect(result.layoutBoundingRect.height.toNumber()).toBe(horizontal ? 60 : 100)
        expect(computed.limits.components[child.id]).toMatchObject({
          [firstField]: { min: { value: new BigNumber(firstMinimum) } },
          [secondField]: { min: { value: new BigNumber(secondMinimum) } },
        })
        expectBoundingRect(computed.components[sibling.id], horizontal ? [110, 0, 20, 20] : [0, 110, 20, 20])
        const end = horizontal
          ? result.boundingRect.x.plus(result.boundingRect.width)
          : result.boundingRect.y.plus(result.boundingRect.height)
        expect(end.toNumber()).toBe(100 + adjustedSecond)
        expect(source).toEqual(snapshot)
      },
    )
  })

  it('uses separate width and height limits for uniform compression', () => {
    const root = d.rootPanel({ id: 'root', width: 200, height: 200, children: ['child'] })
    const config = {
      id: 'child',
      width: 100,
      height: 60,
      autoWidth: false,
      autoHeight: false,
      offAxisAnchor: 'start' as const,
      individualStretch: false,
      leftStretch: -80,
      rightStretch: -80,
      topStretch: -80,
      bottomStretch: -80,
    }
    const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
    const computed = getComputedSubProject(
      d.subProject({
        id: 'sub-project',
        root,
        components: [child],
      }),
      defaultStitchingSettings,
    )
    expectBoundingRect(computed.components[child.id], [50, 30, 0, 0])
    expect(computed.limits.components[child.id]).toMatchObject({
      leftStretch: { min: { value: new BigNumber(-50) } },
      rightStretch: { min: { value: new BigNumber(-50) } },
      topStretch: { min: { value: new BigNumber(-30) } },
      bottomStretch: { min: { value: new BigNumber(-30) } },
    })
  })
})
