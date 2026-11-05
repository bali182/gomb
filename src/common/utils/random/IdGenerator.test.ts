import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IdPrefixSchema } from '../../schemas/idGenerator'
import { IdGenerator } from './IdGenerator'

const { random } = vi.hoisted(() => ({ random: vi.fn() }))
vi.mock('nanoid', () => ({ customAlphabet: () => random }))

beforeEach(() => {
  random.mockReset().mockReturnValue('AAAAAAAAAA')
})

describe('IdGenerator', () => {
  const types: IdPrefixSchema[] = [
    'project',
    'sub-project',
    'component',
    'hole',
    'stitch-line',
    'pocket-opening',
    'constraint',
    'constraint-field',
  ]
  it.each(types)('prefixes %s IDs', (type) => {
    expect(new IdGenerator().get(type)).toBe(`${type}-AAAAAAAAAA`)
  })

  it('does not reserve an ID returned by get', () => {
    const generator = new IdGenerator()
    expect(generator.get('hole')).toBe(generator.get('hole'))
  })

  it('retries forbidden IDs and reserves only through getAndForbid', () => {
    const generator = new IdGenerator(['hole-AAAAAAAAAA'])
    random.mockReturnValueOnce('AAAAAAAAAA').mockReturnValueOnce('BBBBBBBBBB')
    expect(generator.getAndForbid('hole')).toBe('hole-BBBBBBBBBB')
    random.mockReturnValueOnce('BBBBBBBBBB').mockReturnValueOnce('CCCCCCCCCC')
    expect(generator.get('hole')).toBe('hole-CCCCCCCCCC')
  })

  it('copies constructor input and supports individual, array and set exclusions', () => {
    const forbidden = new Set(['component-AAAAAAAAAA'])
    const generator = new IdGenerator(forbidden)
    forbidden.clear()
    generator.forbidOne('component-BBBBBBBBBB')
    generator.forbidAll(['component-CCCCCCCCCC'])
    generator.forbidAll(new Set(['component-DDDDDDDDDD']))
    random
      .mockReturnValueOnce('AAAAAAAAAA')
      .mockReturnValueOnce('BBBBBBBBBB')
      .mockReturnValueOnce('CCCCCCCCCC')
      .mockReturnValueOnce('DDDDDDDDDD')
      .mockReturnValueOnce('EEEEEEEEEE')
    expect(generator.get('component')).toBe('component-EEEEEEEEEE')
    expect(forbidden.size).toBe(0)
  })
})
