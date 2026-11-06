import { describe, expect, it } from 'vitest'
import { EN } from '../../translations/en'
import { IdGenerator } from '../random/IdGenerator'
import { NameGenerator } from './NameGenerator'
import { ReadonlyModelObjectFactory } from './ReadonlyModelObjectFactory'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))

describe('createPocketOpening', () => {
  it('creates straight openings without shape parameters', () => {
    expect(modelFactory.createPocketOpening({ type: 'straight' })).toMatchObject({
      type: 'straight',
    })
  })

  it('initializes recessed opening dimensions and radii', () => {
    expect(modelFactory.createPocketOpening({ type: 'recessed' })).toMatchObject({
      type: 'recessed',

      outerInset: 15,
      innerOffset: 15,
      depth: 10,
      outerRadius: 10,
      innerRadius: 10,
    })
  })

  it('initializes the slanted opening side and offset', () => {
    expect(modelFactory.createPocketOpening({ type: 'slanted' })).toMatchObject({
      type: 'slanted',

      offset: 15,
      side: 'start',
    })
  })

  it('initializes optical illusion direction, insets and radii', () => {
    expect(modelFactory.createPocketOpening({ type: 'optical-illusion' })).toMatchObject({
      type: 'optical-illusion',

      direction: 'start',
      startInset: 10,
      endInset: 10,
      leadingRadius: 0,
      trailingRadius: 0,
    })
  })
})
