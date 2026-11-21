import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { addComputedHoleSizes } from './addComputedHoleSizes'
import { getPatchedSubProject } from './getPatchedSubProject'

describe('addComputedHoleSizes', () => {
  it.each([false, true])('writes only automatic base dimensions with autoWidth %s', (autoWidth) => {
    for (const autoHeight of [false, true]) {
      const manual = d.hole({ id: 'manual', componentId: 'root-front' })
      const hole = d.hole({
        id: 'hole',
        componentId: 'root-front',
        autoWidth,
        autoHeight,
        leftStretch: 12,
        topStretch: -5,
      })
      const source = d.subProject({
        id: 'sub',
        root: d.rootPanel({ id: 'root', width: 100, height: 80 }),
        holes: [manual, hole],
      })
      const snapshot = structuredClone(source)
      const computed = getComputedSubProject(source, defaultStitchingSettings)
      const result = addComputedHoleSizes(source, computed)
      expect(result.holes[0]).toBe(manual)
      expect(result.holes[1]).toMatchObject({
        width: autoWidth ? 100 : 20,
        height: autoHeight ? 80 : 20,
        leftStretch: 12,
        topStretch: -5,
      })
      expect(source).toEqual(snapshot)
      expect(addComputedHoleSizes(result, computed)).toBe(result)
      expect(addComputedHoleSizes(result, getComputedSubProject(result, defaultStitchingSettings))).toBe(result)
      if (!autoWidth && !autoHeight) {
        expect(result).toBe(source)
      }
    }
  })

  it('updates automatic sizes when the owner is resized', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 170, height: 90 }),
      holes: [
        d.hole({ id: 'hole', componentId: 'root-front', autoWidth: true, autoHeight: true, width: 100, height: 80 }),
      ],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(addComputedHoleSizes(source, computed).holes[0]).toMatchObject({ width: 170, height: 90 })
  })

  it('skips missing computed holes and the pipeline removes orphaned holes before patching', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [d.hole({ id: 'hole', componentId: 'missing', autoWidth: true })],
    })
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    expect(addComputedHoleSizes(source, computed)).toBe(source)
    expect(getPatchedSubProject(source, computed).holes).toEqual([])
  })
})
