import { describe, expect, it } from 'vitest'
import type { PocketOpeningSchema } from '../../../schemas/pocketOpening'
import { createPocketOpening } from './createPocketOpening'

describe('createPocketOpening', () => {
  it.each<PocketOpeningSchema['type']>(['straight', 'recessed', 'slanted', 'optical-illusion'])(
    'preserves the supplied identity for %s openings',
    (type) => {
      const opening = createPocketOpening({ type, id: 'custom-id', name: 'Custom name' })
      expect(opening).toMatchObject({ type, id: 'custom-id', name: 'Custom name' })
      const second = createPocketOpening({ type, id: 'second-id', name: 'Second name' })
      expect(second).not.toBe(opening)
      expect(opening).toMatchObject({ id: 'custom-id', name: 'Custom name' })
    },
  )

  it('creates straight openings without shape parameters', () => {
    expect(createPocketOpening({ type: 'straight', id: 'straight', name: 'Straight' })).toEqual({
      type: 'straight',
      id: 'straight',
      name: 'Straight',
    })
  })

  it('initializes recessed opening dimensions and radii', () => {
    expect(createPocketOpening({ type: 'recessed', id: 'recessed', name: 'Recessed' })).toEqual({
      type: 'recessed',
      id: 'recessed',
      name: 'Recessed',
      outerInset: 15,
      innerOffset: 15,
      depth: 10,
      outerRadius: 10,
      innerRadius: 10,
    })
  })

  it('initializes the slanted opening side and offset', () => {
    expect(createPocketOpening({ type: 'slanted', id: 'slanted', name: 'Slanted' })).toEqual({
      type: 'slanted',
      id: 'slanted',
      name: 'Slanted',
      offset: 15,
      side: 'start',
    })
  })

  it('initializes optical illusion direction, insets and radii', () => {
    expect(createPocketOpening({ type: 'optical-illusion', id: 'optical', name: 'Optical' })).toEqual({
      type: 'optical-illusion',
      id: 'optical',
      name: 'Optical',
      direction: 'start',
      startInset: 10,
      endInset: 10,
      leadingRadius: 0,
      trailingRadius: 0,
    })
  })
})
