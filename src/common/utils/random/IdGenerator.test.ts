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
    'root-panel',
    'panel',
    'pocket-cluster',
    'front-pocket',
    't-pocket',
    't-pocket-stitch-line',
    'component-bounds-stitch-line',
    'hole',
    'straight-pocket-opening',
    'recessed-pocket-opening',
    'slanted-pocket-opening',
    'optical-illusion-pocket-opening',
    'equal-binding',
    'root-panel-binding-field',
    'panel-binding-field',
    'pocket-cluster-binding-field',
    'front-pocket-binding-field',
    't-pocket-binding-field',
    'hole-binding-field',
    'recessed-binding-field',
    'slanted-binding-field',
    'optical-illusion-binding-field',
    'component-bounds-stitch-line-binding-field',
    't-pocket-stitch-line-binding-field',
  ]
  it.each(types)('prefixes %s IDs', (type) => {
    expect(new IdGenerator().get(type)).toBe(`${type}-AAAAAAAAAA`)
  })

  it('does not reserve an ID returned by get', () => {
    const generator = new IdGenerator()
    const forbidden = new Set<string>()
    expect(generator.get('hole', forbidden)).toBe(generator.get('hole', forbidden))
    expect(forbidden.size).toBe(0)
  })

  it('retries forbidden IDs and reserves only through getAndForbid', () => {
    const generator = new IdGenerator()
    const forbidden = new Set(['hole-AAAAAAAAAA'])
    random.mockReturnValueOnce('AAAAAAAAAA').mockReturnValueOnce('BBBBBBBBBB')
    expect(generator.getAndForbid('hole', forbidden)).toBe('hole-BBBBBBBBBB')
    expect(forbidden).toEqual(new Set(['hole-AAAAAAAAAA', 'hole-BBBBBBBBBB']))
    random.mockReturnValueOnce('BBBBBBBBBB').mockReturnValueOnce('CCCCCCCCCC')
    expect(generator.get('hole', forbidden)).toBe('hole-CCCCCCCCCC')
    expect(forbidden.has('hole-CCCCCCCCCC')).toBe(false)
  })

  it('does not retain exclusions between callers', () => {
    const generator = new IdGenerator()
    generator.getAndForbid('panel', new Set())
    expect(generator.get('panel')).toBe('panel-AAAAAAAAAA')
  })

  it('reads a readonly set without changing it', () => {
    const forbidden: ReadonlySet<string> = new Set(['panel-AAAAAAAAAA'])
    random.mockReturnValueOnce('AAAAAAAAAA').mockReturnValueOnce('BBBBBBBBBB')
    expect(new IdGenerator().get('panel', forbidden)).toBe('panel-BBBBBBBBBB')
    expect([...forbidden]).toEqual(['panel-AAAAAAAAAA'])
  })
})
