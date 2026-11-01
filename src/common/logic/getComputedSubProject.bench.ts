import BigNumber from 'bignumber.js'
import { describe, expect, it, vi, type BenchCompareOptions } from 'vitest'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'

import { defaultStitchingSettings } from '../defaultStates'
import type { PathSchema } from '../schemas/geometry'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { StitchLineSchema } from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import * as flattenOperations from './flattenJsUtils'
import { isPointInClosedPath } from './isPointInClosedPath'
import { getClosedPathLoops } from './pathSegments'

// Both functions use the current project calculation. Only the contour adapter differs.
const { getComputedSubProject: computeCurrent } = await import('./getComputedSubProject')
vi.resetModules()
vi.doMock('./closedPathBooleanUtils', () => flattenOperations)
const { getComputedSubProject: computeFlatten } = await import('./getComputedSubProject')
vi.doUnmock('./closedPathBooleanUtils')

type ClusterBenchmarkParams = {
  clusterCount: number
  pocketCount: number
  opening: PocketOpeningSchema
  holesPerCluster: number
}

type ComputationBenchmarkCase = {
  name: string
  subProject: SubProjectSchema
}

const straight: PocketOpeningSchema = { id: 'opening', name: 'Opening', type: 'straight' }
const recessed: PocketOpeningSchema = {
  id: 'opening',
  name: 'Opening',
  type: 'recessed',
  outerInset: 18,
  innerOffset: 15,
  depth: 8,
  outerRadius: 3,
  innerRadius: 4,
}

const createClusterSubProject = ({
  clusterCount,
  pocketCount,
  opening,
  holesPerCluster,
}: ClusterBenchmarkParams): SubProjectSchema => {
  const panelIds = Array.from({ length: clusterCount }, (_, index) => `panel-${index}`)
  const clusterIds = Array.from({ length: clusterCount }, (_, index) => `cluster-${index}`)
  return d.subProject({
    id: 'benchmark',
    pocketOpenings: [opening],
    root: d.rootPanel({ id: 'root', width: clusterCount * 120, height: 160, children: panelIds }),
    components: panelIds.flatMap((panelId, index) => {
      const pocketIds = Array.from({ length: pocketCount }, (_, number) => clusterIds[index] + '-pocket-' + number)
      return [
        d.panel({ id: panelId, children: [clusterIds[index]] }),
        d.pocketCluster({ id: clusterIds[index], children: pocketIds, pocketStep: 10 }),
        ...pocketIds.map((id, number) =>
          number === pocketCount - 1
            ? d.frontPocket({
                id,
                openingId: opening.id,
                topLeftRadius: 4,
                topRightRadius: 4,
                bottomLeftRadius: 4,
                bottomRightRadius: 4,
              })
            : d.tPocket({ id, openingId: opening.id }),
        ),
      ]
    }),
    holes: clusterIds.flatMap((componentId) =>
      Array.from({ length: holesPerCluster }, (_, index) => ({
        ...d.hole({ id: `${componentId}-hole-${index}`, componentId: componentId + '-pocket-0' }),
        xAnchor: 'start' as const,
        yAnchor: 'start' as const,
        xOffset: 24 + index * 18,
        yOffset: 90,
        width: 6,
        height: 6,
        topLeftRadius: 1,
        topRightRadius: 1,
        bottomLeftRadius: 1,
        bottomRightRadius: 1,
      })),
    ),
    stitchLines: clusterIds.flatMap((targetId): StitchLineSchema[] => [
      d.componentBoundsStitchLine({ id: `${targetId}-bounds`, targetId, targetType: 'component' }),
      d.tPocketStitchLine({ id: `${targetId}-pockets`, targetId: targetId + '-pocket-0', targetType: 'component' }),
    ]),
  })
}

const createPanelSubProject = (): SubProjectSchema => {
  const panelIds = ['panel-0', 'panel-1', 'panel-2']
  return d.subProject({
    id: 'benchmark',
    root: d.rootPanel({ id: 'root', width: 360, height: 160, children: panelIds }),
    components: panelIds.map((id) => d.panel({ id, topLeftRadius: 8 })),
    holes: panelIds.flatMap((componentId) =>
      Array.from({ length: 4 }, (_, index) => ({
        ...d.hole({ id: `${componentId}-hole-${index}`, componentId }),
        xAnchor: 'start' as const,
        yAnchor: 'start' as const,
        xOffset: 20 + index * 20,
        yOffset: 40,
        width: 10,
        height: 10,
        topLeftRadius: 2,
        topRightRadius: 2,
        bottomLeftRadius: 2,
        bottomRightRadius: 2,
      })),
    ),
    stitchLines: panelIds.map((targetId) =>
      d.componentBoundsStitchLine({ id: `${targetId}-stitches`, targetId, targetType: 'component' }),
    ),
  })
}

const cases: ComputationBenchmarkCase[] = [
  { name: 'root only', subProject: d.subProject({ id: 'benchmark', root: d.rootPanel({ id: 'root' }) }) },
  { name: '3 rounded panels, 12 holes, 3 stitch lines', subProject: createPanelSubProject() },
  {
    name: '1 cluster, 3 straight pockets, 2 stitch lines',
    subProject: createClusterSubProject({ clusterCount: 1, pocketCount: 3, opening: straight, holesPerCluster: 0 }),
  },
  {
    name: '1 cluster, 8 recessed pockets, 4 holes, 2 stitch lines',
    subProject: createClusterSubProject({ clusterCount: 1, pocketCount: 8, opening: recessed, holesPerCluster: 4 }),
  },
  {
    name: '4 clusters, 24 recessed pockets, 16 holes, 8 stitch lines',
    subProject: createClusterSubProject({ clusterCount: 4, pocketCount: 6, opening: recessed, holesPerCluster: 4 }),
  },
  {
    name: '8 clusters, 64 recessed pockets, 32 holes, 16 stitch lines',
    subProject: createClusterSubProject({ clusterCount: 8, pocketCount: 8, opening: recessed, holesPerCluster: 4 }),
  },
]

const getArea = (path: PathSchema): number => {
  return getClosedPathLoops(path)
    .flat()
    .reduce((area, segment) => {
      const chordArea = segment.start.x.times(segment.end.y).minus(segment.end.x.times(segment.start.y)).toNumber() / 2
      if (narrowers.path.is.lineSegment(segment)) {
        return area + chordArea
      }
      return (
        area + chordArea + (segment.radius.pow(2).toNumber() * (segment.sweepAngle - Math.sin(segment.sweepAngle))) / 2
      )
    }, 0)
}

const expectEquivalentPath = (current: PathSchema, previous: PathSchema): void => {
  expect(getArea(current)).toBeCloseTo(getArea(previous), 5)
  const points = getClosedPathLoops(previous)
    .flat()
    .flatMap((segment) => [segment.start, segment.end])
  if (points.length === 0) {
    expect(current.commands).toHaveLength(0)
    return
  }
  const xs = points.map((point) => point.x.toNumber())
  const ys = points.map((point) => point.y.toNumber())
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  const width = Math.max(...xs) - left
  const height = Math.max(...ys) - top
  for (const xRatio of [0.07, 0.23, 0.43, 0.67, 0.91]) {
    for (const yRatio of [0.03, 0.19, 0.47, 0.71, 0.93]) {
      const point = { x: new BigNumber(left + width * xRatio), y: new BigNumber(top + height * yRatio) }
      expect(isPointInClosedPath(point, current)).toBe(isPointInClosedPath(point, previous))
    }
  }
}

const expectEquivalentSubProject = (current: ComputedSubProjectSchema, previous: ComputedSubProjectSchema): void => {
  expect(Object.keys(current.components)).toEqual(Object.keys(previous.components))
  const accessor = accessors.computedSubProject(previous)
  for (const [id, component] of Object.entries(current.components)) {
    const previousComponent = accessor.component.byId(id)
    expect(component.type).toBe(previousComponent.type)
    expectEquivalentPath(component.path, previousComponent.path)
  }
  expect(Object.keys(current.holes)).toEqual(Object.keys(previous.holes))
  Object.values(current.holes).forEach((hole) =>
    expectEquivalentPath(hole.highlightPath, previous.holes[hole.holeId].highlightPath),
  )
  expect(current.stitchLines).toEqual(previous.stitchLines)
}

const options: BenchCompareOptions = {
  time: 1500,
  iterations: 30,
  warmupTime: 500,
  warmupIterations: 10,
  throws: true,
}

describe.each(cases)('full computation: $name', ({ name, subProject }) => {
  it('compares valid, equivalent results before timing', async ({ bench }) => {
    const originalInput = JSON.stringify(subProject)
    expectEquivalentSubProject(
      computeCurrent(subProject, defaultStitchingSettings),
      computeFlatten(subProject, defaultStitchingSettings),
    )
    expect(JSON.stringify(subProject)).toBe(originalInput)

    let lastComputed: ComputedSubProjectSchema | undefined
    const flatten = bench('Flatten 1.6.12', (): void => {
      lastComputed = computeFlatten(subProject, defaultStitchingSettings)
    })
    const current = bench('Current Cavalier adapter', (): void => {
      lastComputed = computeCurrent(subProject, defaultStitchingSettings)
    })
    const results =
      process.env.POCKET_BOOLEAN_BENCH_REVERSE === '1'
        ? await bench.compare(current, flatten, options)
        : await bench.compare(flatten, current, options)
    expect(lastComputed?.root).toBe(subProject.root)

    const flattenResult = results.get('Flatten 1.6.12')
    const currentResult = results.get('Current Cavalier adapter')
    console.log(
      'GEOMETRY_BENCHMARK',
      JSON.stringify({
        name,
        order: process.env.POCKET_BOOLEAN_BENCH_REVERSE === '1' ? 'current-first' : 'flatten-first',
        flatten: {
          meanMs: flattenResult.latency.mean,
          medianMs: flattenResult.latency.p50,
          p99Ms: flattenResult.latency.p99,
          samples: flattenResult.latency.samplesCount,
        },
        current: {
          meanMs: currentResult.latency.mean,
          medianMs: currentResult.latency.p50,
          p99Ms: currentResult.latency.p99,
          samples: currentResult.latency.samplesCount,
        },
        meanRatio: currentResult.latency.mean / flattenResult.latency.mean,
      }),
    )
  }, 120000)
})
