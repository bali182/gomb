import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../../../defaultStates'
import { createComponent } from './createComponent'

describe('createComponent opening reference', () => {
  it.each(['root-panel', 'panel', 'pocket-cluster'] as const)('creates %s without an opening ID', (type) => {
    const component = createComponent({
      type,
      id: 'component',
      name: 'Component',
      stitchingSettings: defaultStitchingSettings,
    })
    expect(component.type).toBe(type)
    expect(component).not.toHaveProperty('openingId')
  })

  it.each(['front-pocket', 't-pocket'] as const)('rejects a missing opening ID for %s', (type) => {
    expect(() =>
      createComponent({ type, id: 'pocket', name: 'Pocket', stitchingSettings: defaultStitchingSettings }),
    ).toThrow('opening ID is required')
  })

  it.each(['front-pocket', 't-pocket'] as const)('uses the supplied opening reference for %s', (type) => {
    const component = createComponent({
      type,
      id: 'pocket',
      name: 'Pocket',
      openingId: 'custom-default',
      stitchingSettings: defaultStitchingSettings,
    })
    expect(component).toHaveProperty('openingId', 'custom-default')
  })
})
