import { describe, expect, it } from 'vitest'

import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { addComputedSizes } from './addComputedSizes'

describe.each(['panel', 'pocket-cluster'] as const)('addComputedSizes for %s', (type) => {
  it('stores layout dimensions before stretch and preserves stretch fields', () => {
    const root = d.rootPanel({ id: 'root', width: 100, height: 60, children: ['child'] })
    const config = { id: 'child', leftStretch: 5, rightStretch: 10, topStretch: -4, bottomStretch: 6 }
    const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
    const subProject = d.subProject({ id: 'sub-project', root, components: [child] })
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const patched = addComputedSizes(subProject, computed)

    expect(computed.components[child.id].boundingRect.width.toNumber()).toBe(115)
    expect(computed.components[child.id].boundingRect.height.toNumber()).toBe(62)
    expect(patched.components[child.id]).toMatchObject({
      width: 100,
      height: 60,
      autoWidth: true,
      autoHeight: true,
      leftStretch: 5,
      rightStretch: 10,
      topStretch: -4,
      bottomStretch: 6,
    })
    expect(addComputedSizes(patched, computed)).toBe(patched)
  })

  it.each(['horizontal', 'vertical'] as const)(
    'stores zero auto dimensions and zero auto gap in %s layouts',
    (layoutOrientation) => {
      const root = d.rootPanel({
        id: 'root',
        width: 100,
        height: 100,
        children: ['fixed', 'child'],
        layoutOrientation,
        autoLayoutGap: true,
        layoutGap: 30,
      })
      const fixed = d.panel({ id: 'fixed', width: 120, height: 120, autoWidth: false, autoHeight: false })
      const child = type === 'panel' ? d.panel({ id: 'child' }) : d.pocketCluster({ id: 'child' })
      const subProject = d.subProject({ id: 'sub-project', root, components: [fixed, child] })
      const snapshot = structuredClone(subProject)
      const computed = getComputedSubProject(subProject, defaultStitchingSettings)
      const patched = addComputedSizes(subProject, computed)

      expect(patched.components[child.id]).toMatchObject(
        layoutOrientation === 'horizontal' ? { width: 0, height: 100 } : { width: 100, height: 0 },
      )
      expect(accessors.subProject(patched).rootPanel().layoutGap).toBe(0)
      expect(subProject).toEqual(snapshot)
    },
  )

  it('retains zero layout dimensions when auto sizing is switched to fixed', () => {
    const root = d.rootPanel({
      id: 'root',
      children: ['fixed', 'container'],
      width: 100,
      height: 100,
    })
    const fixed = d.panel({ id: 'fixed', width: 100, autoWidth: false })
    const container = d.panel({
      id: 'container',
      layoutOrientation: 'vertical',
      children: ['nested-fixed', 'child'],
    })
    const nestedFixed = d.panel({ id: 'nested-fixed', height: 100, autoHeight: false })
    const child = type === 'panel' ? d.panel({ id: 'child' }) : d.pocketCluster({ id: 'child' })
    const source = d.subProject({
      id: 'sub-project',
      root,
      components: [fixed, container, nestedFixed, child],
    })
    const patched = addComputedSizes(source, getComputedSubProject(source, defaultStitchingSettings))
    const stored = patched.components[child.id]
    if (stored.type === 'root-panel') {
      throw new Error('Expected a layout child')
    }
    const fixedChild = { ...stored, autoWidth: false, autoHeight: false }
    const updated = { ...patched, components: { ...patched.components, [child.id]: fixedChild } }
    const computed = getComputedSubProject(updated, defaultStitchingSettings)
    expect(fixedChild).toMatchObject({ width: 0, height: 0 })
    expect(computed.components[child.id].boundingRect.width.toNumber()).toBe(0)
    expect(computed.components[child.id].boundingRect.height.toNumber()).toBe(0)
  })

  it('keeps fixed sizes even when stretch changes the computed bounds', () => {
    const root = d.rootPanel({ id: 'root', children: ['child'], autoLayoutGap: false })
    const config = {
      id: 'child',
      width: 150,
      height: 130,
      autoWidth: false,
      autoHeight: false,
      leftStretch: 10,
      bottomStretch: -20,
    }
    const child = type === 'panel' ? d.panel(config) : d.pocketCluster(config)
    const subProject = d.subProject({ id: 'sub-project', root, components: [child] })
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const patched = addComputedSizes(subProject, computed)
    expect(patched.components[child.id]).toBe(child)
    expect(patched.components[child.id]).toMatchObject({ width: 150, height: 130 })
  })
})
