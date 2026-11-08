import { describe, expect, it } from 'vitest'
import type { IdPrefixSchema } from '../../schemas/idGenerator'
import { EN } from '../../translations/en'
import { HU } from '../../translations/hu'
import { NameGenerator } from './NameGenerator'

describe('NameGenerator', () => {
  describe('get', () => {
    it.each<[IdPrefixSchema, string]>([
      ['panel', 'Panel 1'],
      ['front-pocket', 'Front pocket 1'],
      ['t-pocket', 'T-pocket 1'],
      ['hole', 'Hole 1'],
      ['component-bounds-stitch-line', 'Stitching 1'],
      ['t-pocket-stitch-line', 'Pocket stitching 1'],
    ])('starts %s names at one in an empty pool', (type, expected) => {
      expect(new NameGenerator(EN.defaultNames).get(type)).toBe(expected)
    })

    it('uses the largest index across known base names without filling gaps', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Panel 2', 'T-pocket 10', 'Front pocket 4'])

      expect(generator.get('front-pocket', forbidden)).toBe('Front pocket 11')
      expect(generator.get('panel', forbidden)).toBe('Panel 11')
    })

    it('shares indices between stitch line types in the same pool', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Stitching 2', 'Pocket stitching 7'])

      expect(generator.get('component-bounds-stitch-line', forbidden)).toBe('Stitching 8')
      expect(generator.get('t-pocket-stitch-line', forbidden)).toBe('Pocket stitching 8')
    })

    it('ignores custom names and names without a matching numeric suffix', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['T-pocket 4', 'Custom 99', 'Panel', 'Panel invalid', 'Panel-99', 'Panel -5'])

      expect(generator.get('panel', forbidden)).toBe('Panel 5')
    })

    it('recognizes only the configured language default names', () => {
      const forbidden = new Set(['T-pocket 10', 'T-zseb 4'])

      expect(new NameGenerator(EN.defaultNames).get('front-pocket', forbidden)).toBe('Front pocket 11')
      expect(new NameGenerator(HU.defaultNames).get('front-pocket', forbidden)).toBe('Elülső zseb 5')
    })

    it('does not reserve returned names or mutate a readonly pool', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden: ReadonlySet<string> = new Set(['Panel 5'])

      expect(generator.get('t-pocket', forbidden)).toBe('T-pocket 6')
      expect(generator.get('t-pocket', forbidden)).toBe('T-pocket 6')
      expect([...forbidden]).toEqual(['Panel 5'])
    })

    it('keeps separate pools independent', () => {
      const generator = new NameGenerator(EN.defaultNames)

      expect(generator.get('panel', new Set(['T-pocket 20']))).toBe('Panel 21')
      expect(generator.get('hole', new Set(['Hole 2']))).toBe('Hole 3')
      expect(generator.get('panel')).toBe('Panel 1')
    })

    it('reuses the next index after the largest existing name is deleted', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Panel 5', 'T-pocket 7'])

      expect(generator.get('front-pocket', forbidden)).toBe('Front pocket 8')
      forbidden.delete('T-pocket 7')
      expect(generator.get('front-pocket', forbidden)).toBe('Front pocket 6')
    })
  })

  describe('getAndForbid', () => {
    it('reserves consecutive indices across different default base names', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Panel 5'])

      expect(generator.getAndForbid('front-pocket', forbidden)).toBe('Front pocket 6')
      expect(generator.getAndForbid('t-pocket', forbidden)).toBe('T-pocket 7')
      expect(generator.getAndForbid('panel', forbidden)).toBe('Panel 8')
      expect(forbidden).toEqual(new Set(['Panel 5', 'Front pocket 6', 'T-pocket 7', 'Panel 8']))
    })
  })

  describe('getByBaseName', () => {
    it('keeps the nearest free source-based name regardless of other default name indices', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Panel 2', 'Panel 4', 'T-pocket 10'])

      expect(generator.getByBaseName('Panel 2', forbidden)).toBe('Panel 3')
      expect(forbidden.has('Panel 3')).toBe(false)
    })

    it('trims a custom base name and skips only its occupied names', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['My pocket 1', 'My pocket 3', 'Panel 20'])

      expect(generator.getByBaseName('  My pocket  ', forbidden)).toBe('My pocket 2')
    })

    it('continues a custom numbered name from its own suffix', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['My pocket 8', 'My pocket 10', 'Panel 20'])

      expect(generator.getByBaseName('  My pocket 7  ', forbidden)).toBe('My pocket 9')
    })
  })

  describe('getByBaseNameAndForbid', () => {
    it('reserves source-based names without adopting the default name pool maximum', () => {
      const generator = new NameGenerator(EN.defaultNames)
      const forbidden = new Set(['Panel 2', 'T-pocket 10'])

      expect(generator.getByBaseNameAndForbid('Panel 2', forbidden)).toBe('Panel 3')
      expect(generator.getByBaseNameAndForbid('Panel 2', forbidden)).toBe('Panel 4')
      expect(forbidden).toEqual(new Set(['Panel 2', 'T-pocket 10', 'Panel 3', 'Panel 4']))
    })
  })
})
