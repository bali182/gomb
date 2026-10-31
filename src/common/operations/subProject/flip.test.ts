import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { narrowers } from '../../utils/narrowers'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultStitchingSettings } from '../../defaultStates'
import { calculatePocketBoundingBox } from '../../logic/calculatePocketBoundingBox'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { createPocketCalculator } from '../../logic/pockets/createPocketCalculator'
import type { AnchorSchema, FlipAxisSchema, HasCornerRadiusValuesSchema } from '../../schemas/common'
import type {
  LayoutOrientationSchema,
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  PocketOpeningSideSchema,
  PocketOrientationSchema,
} from '../../schemas/components'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import type { HoleSchema } from '../../schemas/hole'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { flip } from './flip'

const axes: FlipAxisSchema[] = ['horizontal', 'vertical']

describe.each<LayoutOrientationSchema>(['horizontal', 'vertical'])('flip %s layout alignment', (layoutOrientation) => {
  describe.each<AnchorSchema>(['start', 'middle', 'end'])('%s', (mainAxisAnchor) => {
    it.each(axes)('mirrors alignment at every layout depth along %s', (axis) => {
      const root = d.rootPanel({ id: 'root', children: ['panel'], layoutOrientation, mainAxisAnchor })
      const panel = d.panel({ id: 'panel', children: ['cluster'], layoutOrientation, mainAxisAnchor })
      const cluster = d.pocketCluster({ id: 'cluster', children: ['front'] })
      const front = d.frontPocket({ id: 'front', layoutOrientation, mainAxisAnchor })
      const original = d.subProject({ id: 'sp', root, components: [panel, cluster, front] })
      const mirrored: Record<AnchorSchema, AnchorSchema> = { start: 'end', middle: 'middle', end: 'start' }
      const result = accessors.subProject(flip(original, root, axis))
      const expected = layoutOrientation === axis ? mirrored[mainAxisAnchor] : mainAxisAnchor
      expect(result.component.rootPanel().mainAxisAnchor).toBe(expected)
      expect(result.component.panel('panel').mainAxisAnchor).toBe(expected)
      expect(result.component.frontPocket('front').mainAxisAnchor).toBe(expected)
      expect(flip(flip(original, root, axis), root, axis)).toEqual(original)
    })

    it.each([30, 80])('reflects the computed positions of unequal children with second size %s', (secondSize) => {
      const root = d.rootPanel({
        id: 'root',
        width: 100,
        height: 100,
        children: ['a', 'b'],
        layoutOrientation,
        mainAxisAnchor,
        layoutGap: 10,
      })
      const a = d.panel({ id: 'a', width: 20, height: 20, autoWidth: false, autoHeight: false })
      const b = d.panel({ id: 'b', width: secondSize, height: secondSize, autoWidth: false, autoHeight: false })
      const original = d.subProject({ id: 'sp', root, components: [a, b] })
      const before = getComputedSubProject(original, defaultStitchingSettings)
      const after = getComputedSubProject(flip(original, root, layoutOrientation), defaultStitchingSettings)
      const position = layoutOrientation === 'horizontal' ? 'x' : 'y'
      const size = layoutOrientation === 'horizontal' ? 'width' : 'height'
      for (const child of [a, b]) {
        const bounds = before.components[child.id].boundingRect
        expect(after.components[child.id].boundingRect[position].toNumber()).toBe(
          100 - bounds[position].toNumber() - bounds[size].toNumber(),
        )
      }
    })
  })
})

const radii: HasCornerRadiusValuesSchema = {
  topLeftRadius: 1,
  topRightRadius: 2,
  bottomLeftRadius: 3,
  bottomRightRadius: 4,
}
const mirroredRadii: Record<FlipAxisSchema, HasCornerRadiusValuesSchema> = {
  horizontal: { topLeftRadius: 2, topRightRadius: 1, bottomLeftRadius: 4, bottomRightRadius: 3 },
  vertical: { topLeftRadius: 3, topRightRadius: 4, bottomLeftRadius: 1, bottomRightRadius: 2 },
}

type OrientationFlipCase = {
  orientation: PocketOrientationSchema
  axis: FlipAxisSchema
  expectedOrientation: PocketOrientationSchema
  swapsEnds: boolean
}

const orientationCases: OrientationFlipCase[] = [
  { orientation: 'up', axis: 'horizontal', expectedOrientation: 'up', swapsEnds: true },
  { orientation: 'up', axis: 'vertical', expectedOrientation: 'down', swapsEnds: false },
  { orientation: 'down', axis: 'horizontal', expectedOrientation: 'down', swapsEnds: true },
  { orientation: 'down', axis: 'vertical', expectedOrientation: 'up', swapsEnds: false },
  { orientation: 'left', axis: 'horizontal', expectedOrientation: 'right', swapsEnds: false },
  { orientation: 'left', axis: 'vertical', expectedOrientation: 'left', swapsEnds: true },
  { orientation: 'right', axis: 'horizontal', expectedOrientation: 'left', swapsEnds: false },
  { orientation: 'right', axis: 'vertical', expectedOrientation: 'right', swapsEnds: true },
]

const createClusterSubProject = (orientation: PocketOrientationSchema): SubProjectSchema => {
  return d.subProject({
    id: 'sub-project',
    root: d.rootPanel({ id: 'root', children: ['cluster', 'outside'], ...radii }),
    components: [
      d.pocketCluster({
        id: 'cluster',
        orientation,
        children: ['t', 'front'],
        pocketStep: 12,
        topStretch: -2,
        rightStretch: 3,
        bottomStretch: 5,
        leftStretch: 7,
      }),
      d.tPocket({
        id: 't',
        itemId: 'ID-1',
        itemOrientation: 'portrait',
        itemCrossAxisOffset: 9,
        itemOpeningOffset: 13,
        tPocketTabWidth: 10,
        tPocketTaper: 25,
        opening: { type: 'slanted', side: 'start', offset: 15 },
      }),
      d.frontPocket({
        id: 'front',
        ...radii,
        itemId: 'ID-2',
        itemCrossAxisOffset: -4,
        itemOpeningOffset: 7,
        opening: { type: 'slanted', side: 'end', offset: 9 },
      }),
      d.panel({ id: 'outside', ...radii }),
    ],
    stitchLines: [
      d.tPocketStitchLine({
        id: 't-stitch',
        targetType: 'component',
        targetId: 't',
        startOffset: 2,
        endOffset: 7,
        stitchDirection: 'start-to-end',
      }),
    ],
  })
}

describe.each(axes)('flip: %s', (axis) => {
  it('mirrors panel radii and signed stretch without moving the selected root within its parent', () => {
    const panel = d.panel({
      id: 'panel',
      ...radii,
      individualRadii: true,
      individualStretch: true,
      topStretch: -2,
      rightStretch: 3,
      bottomStretch: 5,
      leftStretch: 7,
      offAxisAnchor: 'start',
      color: '#123456',
      autoWidth: false,
      width: 80,
      height: 60,
    })
    const root = d.rootPanel({ id: 'root', children: ['panel'] })
    const original = d.subProject({ id: 'sp', root, components: [panel] })
    const expectedStretch =
      axis === 'horizontal'
        ? { topStretch: -2, rightStretch: 7, bottomStretch: 5, leftStretch: 3 }
        : { topStretch: 5, rightStretch: 3, bottomStretch: -2, leftStretch: 7 }
    const result = flip(original, panel, axis)
    expect(result.components.panel).toEqual({
      ...panel,
      ...mirroredRadii[axis],
      ...expectedStretch,
      mainAxisAnchor: axis === panel.layoutOrientation ? 'end' : 'start',
    })
    expect(result.components.root).toBe(root)
  })

  it('mirrors root-panel radii and layout alignment while preserving its dimensions', () => {
    const root = d.rootPanel({ id: 'root', ...radii, individualRadii: true, width: 170, height: 110, layoutGap: 6 })
    const original = d.subProject({ id: 'sp', root })
    expect(flip(original, root, axis).components.root).toEqual({
      ...root,
      ...mirroredRadii[axis],
      mainAxisAnchor: axis === root.layoutOrientation ? 'end' : 'start',
    })
  })

  it.each<LayoutOrientationSchema>(['horizontal', 'vertical'])(
    'mirrors %s layout order or off-axis anchors',
    (layoutOrientation) => {
      const root = d.rootPanel({ id: 'root', children: ['a', 'b', 'c'], layoutOrientation })
      const a = d.panel({ id: 'a', offAxisAnchor: 'start' })
      const b = d.panel({ id: 'b', offAxisAnchor: 'middle' })
      const c = d.pocketCluster({ id: 'c', offAxisAnchor: 'end' })
      const original = d.subProject({ id: 'sp', root, components: [a, b, c] })
      const result = accessors.subProject(flip(original, root, axis))
      expect(result.component.rootPanel().children).toEqual(
        axis === layoutOrientation ? ['c', 'b', 'a'] : ['a', 'b', 'c'],
      )
      expect(result.component.panel('a').offAxisAnchor).toBe(axis === layoutOrientation ? 'start' : 'end')
      expect(result.component.panel('b').offAxisAnchor).toBe('middle')
      expect(result.component.pocketCluster('c').offAxisAnchor).toBe(axis === layoutOrientation ? 'end' : 'start')
    },
  )

  it('applies layout mirroring at every depth, including children of a front pocket', () => {
    const source = createClusterSubProject('up')
    const front = accessors.subProject(source).component.frontPocket('front')
    const original: SubProjectSchema = {
      ...source,
      components: {
        ...source.components,
        front: { ...front, layoutOrientation: axis, children: ['panel', 'sibling'] },
        panel: d.panel({
          id: 'panel',
          children: ['grandchild'],
          layoutOrientation: axis === 'horizontal' ? 'vertical' : 'horizontal',
        }),
        sibling: d.panel({ id: 'sibling' }),
        grandchild: d.panel({ id: 'grandchild', offAxisAnchor: 'start', ...radii }),
      },
    }
    const result = accessors.subProject(flip(original, front, axis))
    expect(result.component.frontPocket('front').children).toEqual(['sibling', 'panel'])
    expect(result.component.panel('grandchild').offAxisAnchor).toBe('end')
    expect(result.component.panel('grandchild')).toMatchObject(mirroredRadii[axis])
    expect(result.component.pocketCluster('cluster')).toBe(original.components.cluster)
  })

  it.each<{ anchor: AnchorSchema; expected: AnchorSchema }>([
    { anchor: 'start', expected: 'end' },
    { anchor: 'middle', expected: 'middle' },
    { anchor: 'end', expected: 'start' },
  ])('mirrors a $anchor-anchored hole and its own radii', ({ anchor, expected }) => {
    const root = d.rootPanel({ id: 'root' })
    const hole: HoleSchema = {
      ...d.hole({ id: 'hole', componentId: 'root' }),
      xAnchor: anchor,
      yAnchor: anchor,
      xOffset: 11,
      yOffset: -17,
      ...radii,
    }
    const original = d.subProject({ id: 'sp', root, holes: [hole] })
    const position =
      axis === 'horizontal'
        ? { xAnchor: expected, xOffset: anchor === 'middle' ? -11 : 11 }
        : { yAnchor: expected, yOffset: anchor === 'middle' ? 17 : -17 }
    expect(flip(original, hole, axis).holes[0]).toEqual({ ...hole, ...mirroredRadii[axis], ...position })
  })

  it('mirrors hole-targeted stitching without changing the owner or unrelated stitching', () => {
    const root = d.rootPanel({ id: 'root', ...radii })
    const hole: HoleSchema = { ...d.hole({ id: 'hole', componentId: 'root' }), ...radii }
    const ownStitch = d.componentBoundsStitchLine({ id: 'own', targetId: 'hole', targetType: 'hole', ...radii })
    const otherStitch = d.componentBoundsStitchLine({
      id: 'other',
      targetId: 'root',
      targetType: 'component',
      ...radii,
    })
    const original = d.subProject({ id: 'sp', root, holes: [hole], stitchLines: [ownStitch, otherStitch] })
    const result = flip(original, hole, axis)
    expect(result.components.root).toBe(root)
    expect(result.stitchLines[0]).toMatchObject(mirroredRadii[axis])
    expect(result.stitchLines[1]).toBe(otherStitch)
  })

  it('mirrors standard stitch sides, offsets, radii, disconnected corners and individual directions', () => {
    const root = d.rootPanel({ id: 'root' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch',
      targetType: 'component',
      targetId: 'root',
      onTop: 'overlay',
      ...radii,
      autoCornerRadius: false,
      individualRadii: true,
      stitchMargin: 7,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topLeftCorner: true,
      topRightCorner: false,
      bottomLeftCorner: false,
      bottomRightCorner: true,
      stitchDisconnectedTopLeftCorner: true,
      stitchDisconnectedTopRightCorner: false,
      stitchDisconnectedBottomLeftCorner: false,
      stitchDisconnectedBottomRightCorner: true,
      topStartOffset: 1,
      topEndOffset: 2,
      rightStartOffset: 3,
      rightEndOffset: 4,
      bottomStartOffset: 5,
      bottomEndOffset: 6,
      leftStartOffset: 7,
      leftEndOffset: 8,
      topStitchDirection: 'left-to-right',
      bottomStitchDirection: 'right-to-left',
      leftStitchDirection: 'top-to-bottom',
      rightStitchDirection: 'bottom-to-top',
    })
    const original = d.subProject({ id: 'sp', root, stitchLines: [stitchLine] })
    const expected =
      axis === 'horizontal'
        ? {
            top: true,
            right: false,
            bottom: false,
            left: true,
            topLeftCorner: false,
            topRightCorner: true,
            bottomLeftCorner: true,
            bottomRightCorner: false,
            stitchDisconnectedTopLeftCorner: false,
            stitchDisconnectedTopRightCorner: true,
            stitchDisconnectedBottomLeftCorner: true,
            stitchDisconnectedBottomRightCorner: false,
            topStartOffset: 2,
            topEndOffset: 1,
            rightStartOffset: 8,
            rightEndOffset: 7,
            bottomStartOffset: 6,
            bottomEndOffset: 5,
            leftStartOffset: 4,
            leftEndOffset: 3,
            topStitchDirection: 'right-to-left',
            bottomStitchDirection: 'left-to-right',
            leftStitchDirection: 'bottom-to-top',
            rightStitchDirection: 'top-to-bottom',
          }
        : {
            top: false,
            right: true,
            bottom: true,
            left: false,
            topLeftCorner: false,
            topRightCorner: true,
            bottomLeftCorner: true,
            bottomRightCorner: false,
            stitchDisconnectedTopLeftCorner: false,
            stitchDisconnectedTopRightCorner: true,
            stitchDisconnectedBottomLeftCorner: true,
            stitchDisconnectedBottomRightCorner: false,
            topStartOffset: 6,
            topEndOffset: 5,
            rightStartOffset: 4,
            rightEndOffset: 3,
            bottomStartOffset: 2,
            bottomEndOffset: 1,
            leftStartOffset: 8,
            leftEndOffset: 7,
            topStitchDirection: 'right-to-left',
            bottomStitchDirection: 'left-to-right',
            leftStitchDirection: 'bottom-to-top',
            rightStitchDirection: 'top-to-bottom',
          }
    const result = flip(original, stitchLine, axis)
    expect(result.stitchLines[0]).toEqual({ ...stitchLine, ...mirroredRadii[axis], ...expected })
    expect(result.components.root).toBe(root)
  })

  it('includes owned holes and both target types of stitching while leaving outside objects untouched', () => {
    const root = d.rootPanel({ id: 'root', children: ['selected', 'outside'] })
    const selected = d.panel({ id: 'selected', children: ['child'] })
    const child = d.panel({ id: 'child', ...radii })
    const outside = d.panel({ id: 'outside', ...radii })
    const ownHole: HoleSchema = { ...d.hole({ id: 'hole', componentId: 'child' }), ...radii }
    const outsideHole: HoleSchema = { ...d.hole({ id: 'outside-hole', componentId: 'outside' }), ...radii }
    const componentStitch = d.componentBoundsStitchLine({
      id: 'component-stitch',
      targetType: 'component',
      targetId: 'child',
      ...radii,
    })
    const holeStitch = d.componentBoundsStitchLine({
      id: 'hole-stitch',
      targetType: 'hole',
      targetId: 'hole',
      ...radii,
    })
    const outsideStitch = d.componentBoundsStitchLine({
      id: 'outside-stitch',
      targetType: 'component',
      targetId: 'outside',
      onTop: 'selected',
      ...radii,
    })
    const outsideHoleStitch = d.componentBoundsStitchLine({
      id: 'outside-hole-stitch',
      targetType: 'hole',
      targetId: 'outside-hole',
      ...radii,
    })
    const original = d.subProject({
      id: 'sp',
      root,
      components: [selected, child, outside],
      holes: [ownHole, outsideHole],
      stitchLines: [componentStitch, holeStitch, outsideStitch, outsideHoleStitch],
    })
    const result = flip(original, selected, axis)
    expect(result.components.child).toMatchObject(mirroredRadii[axis])
    expect(result.components.outside).toBe(outside)
    expect(result.components.root).toBe(root)
    expect(result.holes[0]).toMatchObject(mirroredRadii[axis])
    expect(result.holes[1]).toBe(outsideHole)
    expect(result.stitchLines[0]).toMatchObject(mirroredRadii[axis])
    expect(result.stitchLines[1]).toMatchObject(mirroredRadii[axis])
    expect(result.stitchLines[2]).toBe(outsideStitch)
    expect(result.stitchLines[3]).toBe(outsideHoleStitch)
  })

  it('distinguishes identical component, hole and stitch-line IDs', () => {
    const root = d.rootPanel({ id: 'root', children: ['shared', 'outside'] })
    const component = d.panel({ id: 'shared', ...radii })
    const outside = d.panel({ id: 'outside' })
    const hole: HoleSchema = { ...d.hole({ id: 'shared', componentId: 'outside' }), ...radii }
    const stitchLine = d.componentBoundsStitchLine({
      id: 'shared',
      targetType: 'component',
      targetId: 'outside',
      ...radii,
    })
    const holeStitch = d.componentBoundsStitchLine({
      id: 'hole-stitch',
      targetType: 'hole',
      targetId: 'shared',
      ...radii,
    })
    const original = d.subProject({
      id: 'sp',
      root,
      components: [component, outside],
      holes: [hole],
      stitchLines: [stitchLine, holeStitch],
    })

    const componentResult = flip(original, component, axis)
    expect(componentResult.components.shared).toMatchObject(mirroredRadii[axis])
    expect(componentResult.holes[0]).toBe(hole)
    expect(componentResult.stitchLines).toEqual(original.stitchLines)

    const holeResult = flip(original, hole, axis)
    expect(holeResult.components.shared).toBe(component)
    expect(holeResult.holes[0]).toMatchObject(mirroredRadii[axis])
    expect(holeResult.stitchLines[0]).toBe(stitchLine)
    expect(holeResult.stitchLines[1]).toMatchObject(mirroredRadii[axis])

    const stitchResult = flip(original, stitchLine, axis)
    expect(stitchResult.components.shared).toBe(component)
    expect(stitchResult.holes[0]).toBe(hole)
    expect(stitchResult.stitchLines[1]).toBe(holeStitch)
    expect(stitchResult.stitchLines[0]).toMatchObject(mirroredRadii[axis])
  })

  it('uses the current stored model instead of stale values supplied by a caller', () => {
    const original = createClusterSubProject('up')
    const stale = d.rootPanel({ id: 'root', ...radii, topLeftRadius: 99, children: [] })
    expect(flip(original, stale, axis)).toEqual(flip(original, original.components.root, axis))
  })

  it('flips only the selected stitch-line type regardless of source order', () => {
    const source = createClusterSubProject(axis === 'horizontal' ? 'up' : 'left')
    const pocketStitch = accessors.subProject(source).stitchLine.tPocket('t-stitch')
    const boundsStitch = d.componentBoundsStitchLine({
      id: 'bounds-stitch',
      targetType: 'component',
      targetId: 'root',
      ...radii,
    })
    const original = { ...source, stitchLines: [boundsStitch, pocketStitch] }
    const pocketResult = flip(original, pocketStitch, axis)
    expect(pocketResult.stitchLines[0]).toBe(boundsStitch)
    expect(pocketResult.stitchLines[1]).toEqual({
      ...pocketStitch,
      startOffset: 7,
      endOffset: 2,
      stitchDirection: 'end-to-start',
    })

    const reordered = { ...original, stitchLines: [pocketStitch, boundsStitch] }
    const boundsResult = flip(reordered, boundsStitch, axis)
    expect(boundsResult.stitchLines[0]).toBe(pocketStitch)
    expect(boundsResult.stitchLines[1]).toMatchObject({
      type: 'component-bounds-stitch-line',
      id: 'bounds-stitch',
      ...mirroredRadii[axis],
    })
  })
})

describe.each(orientationCases)(
  'flip: $orientation opening, $axis flip',
  ({ orientation, axis, expectedOrientation, swapsEnds }) => {
    it('mirrors the cluster own radii together with its opening direction', () => {
      const fixture = createClusterSubProject(orientation)
      const cluster = {
        ...accessors.subProject(fixture).component.pocketCluster('cluster'),
        ...radii,
        individualRadii: true,
      }
      const original = { ...fixture, components: { ...fixture.components, cluster } }
      const before = structuredClone(original)
      const result = flip(original, cluster, axis)
      const flippedCluster = accessors.subProject(result).component.pocketCluster(cluster.id)
      expect(flippedCluster).toMatchObject({
        ...mirroredRadii[axis],
        individualRadii: true,
        orientation: expectedOrientation,
      })
      expect(flip(result, flippedCluster, axis)).toEqual(original)
      expect(original).toEqual(before)
    })

    it('flips cluster stitching once with its owner and keeps it unchanged when only a pocket is flipped', () => {
      const fixture = createClusterSubProject(orientation)
      const shared = {
        ...accessors.subProject(fixture).stitchLine.tPocket('t-stitch'),
        id: 'shared',
        targetId: 'cluster',
      }
      const unrelated = { ...shared, id: 'unrelated', targetId: 'outside' }
      const original = {
        ...fixture,
        components: {
          ...fixture.components,
          cluster: {
            ...accessors.subProject(fixture).component.pocketCluster('cluster'),
            children: ['t', 'second', 'front'],
          },
          second: { ...accessors.subProject(fixture).component.tPocket('t'), id: 'second' },
        },
        stitchLines: [...fixture.stitchLines, shared, unrelated],
      }
      const snapshot = structuredClone(original)
      const source = accessors.subProject(original)
      const clusterResult = flip(original, source.component.pocketCluster('cluster'), axis)
      const accessor = accessors.subProject(clusterResult)
      expect(accessor.stitchLine.tPocket('shared')).toMatchObject({
        targetId: 'cluster',
        startOffset: swapsEnds ? 7 : 2,
        endOffset: swapsEnds ? 2 : 7,
        stitchDirection: swapsEnds ? 'end-to-start' : 'start-to-end',
      })
      expect(accessor.stitchLine.tPocket('shared')).toEqual({
        ...accessor.stitchLine.tPocket('t-stitch'),
        id: 'shared',
        targetId: 'cluster',
      })
      expect(accessor.stitchLine.tPocket('unrelated')).toBe(unrelated)
      const pocketResult = accessors.subProject(flip(original, source.component.tPocket('t'), axis))
      expect(pocketResult.stitchLine.tPocket('shared')).toBe(shared)
      const beforeGeometry = accessors.computedSubProject(getComputedSubProject(original, defaultStitchingSettings))
      const afterGeometry = accessors.computedSubProject(getComputedSubProject(clusterResult, defaultStitchingSettings))
      const before = beforeGeometry.stitchLine.byId('shared')
      const after = afterGeometry.stitchLine.byId('shared')
      expect(before.routes).toHaveLength(2)
      expect(after.routes).toHaveLength(2)
      const beforeRect = beforeGeometry.component.pocketCluster('cluster').boundingRect
      const afterRect = afterGeometry.component.pocketCluster('cluster').boundingRect
      for (const route of before.routes) {
        const mirrored = after.routes.find(
          (candidate) => candidate.targetType === route.targetType && candidate.targetId === route.targetId,
        )
        expect(mirrored).toBeDefined()
        if (!isDefined(mirrored)) {
          throw new Error('Expected the same pocket route after flipping')
        }
        const vertices = getVertices(mirrored.path)
        for (const [x, y] of getVertices(route.path)) {
          const relativeX = x - beforeRect.x.toNumber()
          const relativeY = y - beforeRect.y.toNumber()
          const expectedX =
            afterRect.x.toNumber() + (axis === 'horizontal' ? beforeRect.width.toNumber() - relativeX : relativeX)
          const expectedY =
            afterRect.y.toNumber() + (axis === 'vertical' ? beforeRect.height.toNumber() - relativeY : relativeY)
          expect(
            vertices.some(
              ([actualX, actualY]) => Math.abs(actualX - expectedX) < 1e-7 && Math.abs(actualY - expectedY) < 1e-7,
            ),
          ).toBe(true)
        }
      }
      expect(flip(clusterResult, accessor.component.pocketCluster('cluster'), axis)).toEqual(original)
      expect(original).toEqual(snapshot)
    })

    it('mirrors the cluster orientation, stretch, contents and both contained openings without reversing pocket order', () => {
      const original = createClusterSubProject(orientation)
      const source = accessors.subProject(original)
      const result = accessors.subProject(flip(original, source.component.pocketCluster('cluster'), axis))
      expect(result.component.pocketCluster('cluster')).toMatchObject({
        orientation: expectedOrientation,
        children: ['t', 'front'],
        ...(axis === 'horizontal'
          ? { topStretch: -2, rightStretch: 7, bottomStretch: 5, leftStretch: 3 }
          : { topStretch: 5, rightStretch: 3, bottomStretch: -2, leftStretch: 7 }),
      })
      expect(result.component.tPocket('t')).toEqual({
        ...source.component.tPocket('t'),
        itemCrossAxisOffset: swapsEnds ? -9 : 9,
        opening: { type: 'slanted', side: 'end', offset: 15 },
      })
      expect(result.component.frontPocket('front')).toEqual({
        ...source.component.frontPocket('front'),
        itemCrossAxisOffset: swapsEnds ? 4 : -4,
        ...mirroredRadii[axis],
        mainAxisAnchor: axis === 'horizontal' ? 'end' : 'start',
        opening: { type: 'slanted', side: 'start', offset: 9 },
      })
      expect(result.component.byId('outside')).toBe(original.components.outside)
      expect(result.stitchLine.tPocket('t-stitch')).toMatchObject({
        startOffset: swapsEnds ? 7 : 2,
        endOffset: swapsEnds ? 2 : 7,
        stitchDirection: swapsEnds ? 'end-to-start' : 'start-to-end',
      })
    })

    it.each(['ID-1', 'HUF'] as const)(
      'preserves %s selection, orientation and dimensions when flipping the cluster',
      (itemId) => {
        const fixture = createClusterSubProject(orientation)
        const source = accessors.subProject(fixture)
        const original: SubProjectSchema = {
          ...fixture,
          components: {
            ...fixture.components,
            t: { ...source.component.tPocket('t'), itemId },
            front: { ...source.component.frontPocket('front'), itemId },
          },
        }
        const cluster = accessors.subProject(original).component.pocketCluster('cluster')
        const before = getComputedSubProject(original, defaultStitchingSettings)
        const flipped = flip(original, cluster, axis)
        const after = getComputedSubProject(flipped, defaultStitchingSettings)
        const beforeSource = accessors.computedSubProject(before)
        const afterSource = accessors.computedSubProject(after)
        expect(afterSource.component.tPocket('t').item?.item.id).toBe(itemId)
        expect(afterSource.component.frontPocket('front').item?.item.id).toBe(itemId)
        expect(accessors.subProject(flipped).component.tPocket('t')).toMatchObject({
          itemId,
          itemOrientation: 'portrait',
          itemCrossAxisOffset: swapsEnds ? -9 : 9,
          itemOpeningOffset: 13,
        })
        expect(afterSource.component.tPocket('t').item?.boundingRect.width).toEqual(
          beforeSource.component.tPocket('t').item?.boundingRect.width,
        )
        expect(afterSource.component.tPocket('t').item?.boundingRect.height).toEqual(
          beforeSource.component.tPocket('t').item?.boundingRect.height,
        )
        expect(afterSource.component.frontPocket('front').item?.boundingRect.width).toEqual(
          beforeSource.component.frontPocket('front').item?.boundingRect.width,
        )
        expect(afterSource.component.frontPocket('front').item?.boundingRect.height).toEqual(
          beforeSource.component.frontPocket('front').item?.boundingRect.height,
        )
      },
    )

    it('only changes an independently selected pocket opening across its opening width', () => {
      const original = createClusterSubProject(orientation)
      const source = accessors.subProject(original)
      const tResult = accessors.subProject(flip(original, source.component.tPocket('t'), axis))
      expect(tResult.component.tPocket('t').opening).toEqual({
        type: 'slanted',
        offset: 15,
        side: swapsEnds ? 'end' : 'start',
      })
      expect(tResult.component.tPocket('t').itemCrossAxisOffset).toBe(swapsEnds ? -9 : 9)
      expect(tResult.component.pocketCluster('cluster')).toBe(source.component.pocketCluster('cluster'))
      expect(tResult.component.frontPocket('front')).toBe(source.component.frontPocket('front'))
      const frontResult = accessors.subProject(flip(original, source.component.frontPocket('front'), axis))
      expect(frontResult.component.frontPocket('front')).toEqual({
        ...source.component.frontPocket('front'),
        itemCrossAxisOffset: swapsEnds ? 4 : -4,
        ...mirroredRadii[axis],
        mainAxisAnchor: axis === 'horizontal' ? 'end' : 'start',
        opening: { type: 'slanted', offset: 9, side: swapsEnds ? 'start' : 'end' },
      })
      expect(frontResult.component.tPocket('t')).toBe(source.component.tPocket('t'))
    })

    it.each(['start-to-end', 'end-to-start'] as const)(
      'mirrors a %s T-pocket stitch without changing its pocket or cluster',
      (stitchDirection) => {
        const fixture = createClusterSubProject(orientation)
        const source = accessors.subProject(fixture)
        const stitchLine = { ...source.stitchLine.tPocket('t-stitch'), stitchDirection }
        const original = { ...fixture, stitchLines: [stitchLine] }
        const result = flip(original, stitchLine, axis)
        expect(result.components).toBe(original.components)
        expect(result.stitchLines[0]).toEqual(
          swapsEnds
            ? {
                ...stitchLine,
                startOffset: 7,
                endOffset: 2,
                stitchDirection: stitchDirection === 'start-to-end' ? 'end-to-start' : 'start-to-end',
              }
            : stitchLine,
        )
        if (!swapsEnds) {
          expect(result).toBe(original)
        }
      },
    )

    it('produces mirrored T-pocket and front-pocket contour vertices', () => {
      const original = createClusterSubProject(orientation)
      const source = accessors.subProject(original)
      const result = accessors.subProject(flip(original, source.component.pocketCluster('cluster'), axis))
      const rect: RectSchema = {
        x: new BigNumber(11),
        y: new BigNumber(17),
        width: new BigNumber(100),
        height: new BigNumber(120),
      }
      for (const [index, pocketId] of ['t', 'front'].entries()) {
        const pocket = source.component.pocket(pocketId)
        const flippedPocket = result.component.pocket(pocketId)
        const cluster = source.component.pocketCluster('cluster')
        const flippedCluster = result.component.pocketCluster('cluster')
        const calculator = createPocketCalculator(
          pocket,
          cluster,
          pocket.opening,
          calculatePocketBoundingBox(cluster, rect, index),
          ZERO_CORNER_RADIUS,
        )
        const flippedCalculator = createPocketCalculator(
          flippedPocket,
          flippedCluster,
          flippedPocket.opening,
          calculatePocketBoundingBox(flippedCluster, rect, index),
          ZERO_CORNER_RADIUS,
        )
        const before = narrowers.is.tPocket(pocket) ? calculator.getTPocketPath() : calculator.getFrontPocketPath()
        const after = narrowers.is.tPocket(pocket)
          ? flippedCalculator.getTPocketPath()
          : flippedCalculator.getFrontPocketPath()
        const mirroredVertices = getVertices(before).map(([x, y]) =>
          axis === 'horizontal' ? [122 - x, y] : [x, 154 - y],
        )
        const actualVertices = getVertices(after)
        expect(actualVertices).toHaveLength(mirroredVertices.length)
        for (const [x, y] of mirroredVertices) {
          expect(
            actualVertices.some(([actualX, actualY]) => Math.abs(actualX - x) < 1e-8 && Math.abs(actualY - y) < 1e-8),
          ).toBe(true)
        }
      }
    })

    it('preserves straight and recessed settings', () => {
      const original = createClusterSubProject(orientation)
      const source = accessors.subProject(original)
      const openings: PocketOpeningSchema[] = [
        { type: 'straight' },
        { type: 'recessed', outerInset: 15, innerOffset: 8, depth: 10, innerRadius: 5, outerRadius: 3 },
      ]
      for (const opening of openings) {
        const current: SubProjectSchema = {
          ...original,
          components: {
            ...original.components,
            t: { ...source.component.tPocket('t'), opening },
            front: { ...source.component.frontPocket('front'), opening },
          },
        }
        const result = accessors.subProject(flip(current, source.component.pocketCluster('cluster'), axis))
        expect(result.component.tPocket('t').opening).toBe(opening)
        expect(result.component.frontPocket('front').opening).toBe(opening)
      }
    })

    it('preserves the input and restores every selectable model after two flips', () => {
      const original = createClusterSubProject(orientation)
      original.holes.push({ ...d.hole({ id: 'hole', componentId: 'front' }), xAnchor: 'middle', xOffset: 11, ...radii })
      original.stitchLines.push(
        d.componentBoundsStitchLine({ id: 'bounds', targetType: 'hole', targetId: 'hole', ...radii }),
      )
      const snapshot = structuredClone(original)
      const models = [...Object.values(original.components), ...original.holes, ...original.stitchLines]
      for (const model of models) {
        const flipped = flip(original, model, axis)
        expect(flip(flipped, model, axis)).toEqual(snapshot)
        expect(original).toEqual(snapshot)
      }
    })
  },
)

const getVertices = (path: PathSchema): number[][] => {
  return path.commands.flatMap((command) =>
    narrowers.path.is.close(command) ? [] : [[command.point.x.toNumber(), command.point.y.toNumber()]],
  )
}

describe.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])('optical illusion flip: %s', (orientation) => {
  describe.each<PocketOpeningSideSchema>(['start', 'end'])('direction: %s', (direction) => {
    it.each(axes)('mirrors direction and preserves semantic inset/radius values along %s', (axis) => {
      const opening: OpticalIllusionPocketOpeningSchema = {
        type: 'optical-illusion',
        direction,
        startInset: 12,
        endInset: 25,
        leadingRadius: 3,
        trailingRadius: 7,
      }
      const root = d.rootPanel({ id: 'root', children: ['cluster'] })
      const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'], orientation })
      const t = d.tPocket({ id: 't', opening })
      const front = d.frontPocket({ id: 'front', opening })
      const source = d.subProject({ id: 'sub', root, components: [cluster, t, front] })
      const crossAxis = orientation === 'up' || orientation === 'down' ? 'horizontal' : 'vertical'
      const flippedDirection = direction === 'start' ? 'end' : 'start'
      const mirrored = accessors.subProject(flip(source, t, axis)).component.tPocket('t')
      expect(mirrored.opening).toEqual({ ...opening, direction: axis === crossAxis ? flippedDirection : direction })
      const clusterFlip = flip(source, cluster, axis)
      expect(accessors.subProject(clusterFlip).component.tPocket('t').opening).toEqual({
        ...opening,
        direction: flippedDirection,
      })
      expect(flip(clusterFlip, accessors.subProject(clusterFlip).component.pocketCluster('cluster'), axis)).toEqual(
        source,
      )
    })
  })
})
