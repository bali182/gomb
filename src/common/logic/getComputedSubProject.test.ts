import { describe, expect, it } from 'vitest'

import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import { defaultStitchingSettings } from '../defaultStates'
import type { PanelSchema, PocketClusterSchema, PocketOrientationSchema, RootPanelSchema } from '../schemas/components'
import type { ComputedComponentSchema } from '../schemas/computed'
import type { NumberCornerRadiusSchema } from '../schemas/geometry'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { getComputedSubProject } from './getComputedSubProject'

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

type PositiveSqueezeTestCase = {
  panel: Partial<PanelSchema>
  expectedBoundingRect: ExpectedBoundingRect
}

const expectBoundingRect = (component: ComputedComponentSchema, expected: ExpectedBoundingRect) => {
  expect([
    component.boundingRect.x.toNumber(),
    component.boundingRect.y.toNumber(),
    component.boundingRect.width.toNumber(),
    component.boundingRect.height.toNumber(),
  ]).toEqual(expected)
}

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

  it('clamps fixed main-axis and cross-axis sizes to the parent bounds', () => {
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

    expectBoundingRect(computed.panel(wide.id), [0, 0, 100, 20])
    expectBoundingRect(computed.panel(tall.id), [100, 0, 20, 60])
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

  it('uses the clamped cross-axis size to position a fixed child', () => {
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

    expectBoundingRect(computed.panel(child.id), [0, 0, 100, 60])
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

  it.each<PositiveSqueezeTestCase>([
    { panel: { topSqueeze: 10 }, expectedBoundingRect: [0, 10, 60, 50] },
    { panel: { rightSqueeze: 10 }, expectedBoundingRect: [0, 0, 50, 60] },
    { panel: { bottomSqueeze: 10 }, expectedBoundingRect: [0, 0, 60, 50] },
    { panel: { leftSqueeze: 10 }, expectedBoundingRect: [10, 0, 50, 60] },
  ])('squeezes each panel edge inward', (testCase) => {
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

  it('clamps each positive squeeze to half of the original axis size minus one', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['child'] })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'start',
      topSqueeze: 100,
      rightSqueeze: 100,
      bottomSqueeze: 100,
      leftSqueeze: 100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [29.5, 29.5, 1, 1])
  })

  it('clamps negative vertical squeezes to the parent bounds independently', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['child'] })
    const child = d.panel({
      id: 'child',
      width: 60,
      autoWidth: false,
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'middle',
      topSqueeze: -100,
      bottomSqueeze: -100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, 0, 60, 100])
  })

  it('clamps negative horizontal squeezes to the parent bounds independently', () => {
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
      rightSqueeze: -100,
      leftSqueeze: -100,
    })
    const computed = accessors.computedSubProject(
      getComputedSubProject(d.subProject({ id: 'sub-project', root, components: [child] }), defaultStitchingSettings),
    )

    expectBoundingRect(computed.panel(child.id), [0, 0, 100, 60])
  })

  it('does not use a squeezed bounding box to position the next sibling', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 100,
      height: 40,
      layoutGap: 10,
      children: ['first', 'second'],
    })
    const first = d.panel({ id: 'first', width: 20, autoWidth: false, rightSqueeze: -100 })
    const second = d.panel({ id: 'second', width: 20, autoWidth: false })
    const computed = accessors.computedSubProject(
      getComputedSubProject(
        d.subProject({ id: 'sub-project', root, components: [first, second] }),
        defaultStitchingSettings,
      ),
    )

    expectBoundingRect(computed.panel(first.id), [0, 0, 100, 40])
    expectBoundingRect(computed.panel(second.id), [30, 0, 20, 40])
  })

  it('applies squeeze to pocket clusters', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 100, children: ['cluster'] })
    const cluster = d.pocketCluster({
      id: 'cluster',
      height: 60,
      autoHeight: false,
      offAxisAnchor: 'middle',
      topSqueeze: 10,
      bottomSqueeze: 20,
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
