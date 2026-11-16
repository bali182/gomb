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

      recessOuterInset: 15,
      recessInnerOffset: 15,
      recessDepth: 10,
      recessOuterRadius: 10,
      recessInnerRadius: 10,
    })
  })

  it('initializes the slanted opening side and offset', () => {
    expect(modelFactory.createPocketOpening({ type: 'slanted' })).toMatchObject({
      type: 'slanted',

      slantOffset: 15,
      slantSide: 'start',
    })
  })

  it('initializes optical illusion direction, insets and radii', () => {
    expect(modelFactory.createPocketOpening({ type: 'optical-illusion' })).toMatchObject({
      type: 'optical-illusion',

      illusionSide: 'start',
      illusionStartInset: 10,
      illusionEndInset: 10,
      illusionLeadingRadius: 0,
      illusionTrailingRadius: 0,
    })
  })
})
