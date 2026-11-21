import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../../defaultStates'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getComputedSubProject } from '../getComputedSubProject'
import { getPathSegments } from '../pathSegments'
import { getExportChildMarkerPaths } from './getExportChildMarkerPaths'

const rect = (x: number, y: number, width: number, height: number): RectSchema => ({
  x: new BigNumber(x),
  y: new BigNumber(y),
  width: new BigNumber(width),
  height: new BigNumber(height),
})

const createFixture = (): ComputedSubProjectSchema => {
  const source = d.subProject({
    id: 'sub-project',
    root: d.rootPanel({ id: 'root', width: 120, height: 100 }),
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['front-panel'] }),
    backFace: d.rootPanelFace({ id: 'root-back', children: ['back-panel'] }),
    components: [d.panel({ id: 'front-panel' }), d.panel({ id: 'back-panel' })],
  })
  const computed = getComputedSubProject(source, defaultStitchingSettings)
  const accessor = accessors.computedSubProject(computed).component
  accessor.rootPanel().boundingRect = rect(10, 20, 120, 100)
  accessor.panel('front-panel').boundingRect = rect(20, 30, 30, 40)
  accessor.panel('back-panel').boundingRect = rect(30, 80, 20, 15)
  return computed
}

const lineKeys = (paths: PathSchema[]): string[] =>
  paths
    .flatMap((path) => getPathSegments(path))
    .map((segment) => {
      const start = `${segment.start.x},${segment.start.y}`
      const end = `${segment.end.x},${segment.end.y}`
      return [start, end].sort().join(':')
    })
    .sort()

describe('getExportChildMarkerPaths', () => {
  it('combines front markers and reflected back markers around an offset root center', () => {
    const computed = createFixture()
    const accessor = accessors.computedSubProject(computed).component
    const snapshot = structuredClone(computed)

    expect(lineKeys(getExportChildMarkerPaths(accessor.rootPanel(), computed))).toEqual(
      [
        '20,30:50,30',
        '50,30:50,70',
        '20,70:50,70',
        '20,30:20,70',
        '110,80:90,80',
        '110,80:110,95',
        '110,95:90,95',
        '90,80:90,95',
      ].sort(),
    )
    expect(computed).toEqual(snapshot)
  })

  it('draws coincident markers from opposite faces only once', () => {
    const computed = createFixture()
    const accessor = accessors.computedSubProject(computed).component
    accessor.panel('back-panel').boundingRect = rect(90, 30, 30, 40)

    expect(lineKeys(getExportChildMarkerPaths(accessor.rootPanel(), computed))).toEqual(
      ['20,30:50,30', '50,30:50,70', '20,70:50,70', '20,30:20,70'].sort(),
    )
  })

  it('removes reflected back markers that overlap the root outline', () => {
    const computed = createFixture()
    const accessor = accessors.computedSubProject(computed).component
    accessor.rootPanelFace('root-front').children = []
    accessor.panel('back-panel').boundingRect = rect(10, 20, 20, 30)

    expect(lineKeys(getExportChildMarkerPaths(accessor.rootPanel(), computed))).toEqual(
      ['110,50:130,50', '110,20:110,50'].sort(),
    )
  })

  it('returns no markers when both faces are empty', () => {
    const computed = createFixture()
    const accessor = accessors.computedSubProject(computed).component
    accessor.rootPanelFace('root-front').children = []
    accessor.rootPanelFace('root-back').children = []

    expect(getExportChildMarkerPaths(accessor.rootPanel(), computed)).toEqual([])
  })

  it.each(['front', 'back'])('unpacks pocket clusters on the %s face', (side) => {
    const source = d.subProject({
      id: 'sub-project',
      root: d.rootPanel({ id: 'root', width: 120, height: 100 }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: side === 'front' ? ['cluster'] : [] }),
      backFace: d.rootPanelFace({ id: 'root-back', children: side === 'back' ? ['cluster'] : [] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['pocket', 'front-pocket'] }),
        d.tPocket({ id: 'pocket' }),
        d.frontPocket({ id: 'front-pocket' }),
      ],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const accessor = accessors.computedSubProject(computed).component
    accessor.pocketCluster('cluster').boundingRect = rect(5, 5, 100, 90)
    accessor.tPocket('pocket').boundingRect = rect(20, 30, 30, 40)
    accessor.frontPocket('front-pocket').boundingRect = rect(20, 50, 30, 20)

    const left = side === 'front' ? 20 : 70
    const right = side === 'front' ? 50 : 100
    expect(lineKeys(getExportChildMarkerPaths(accessor.rootPanel(), computed))).toEqual(
      [
        [`${left},30`, `${right},30`].sort().join(':'),
        [`${right},30`, `${right},70`].sort().join(':'),
        [`${left},70`, `${right},70`].sort().join(':'),
        [`${left},30`, `${left},70`].sort().join(':'),
        [`${left},50`, `${right},50`].sort().join(':'),
        [`${right},50`, `${right},70`].sort().join(':'),
        [`${left},50`, `${left},70`].sort().join(':'),
      ].sort(),
    )
  })

  it('keeps panel children in their own face coordinates', () => {
    const computed = createFixture()
    const accessor = accessors.computedSubProject(computed).component
    const parent = accessor.panel('back-panel')
    parent.children = ['front-panel']
    parent.boundingRect = rect(10, 20, 100, 80)

    expect(lineKeys(getExportChildMarkerPaths(parent, computed))).toEqual(
      ['20,30:50,30', '50,30:50,70', '20,70:50,70', '20,30:20,70'].sort(),
    )
  })
})
