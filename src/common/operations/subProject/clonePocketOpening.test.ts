import { describe, expect, it } from 'vitest'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { clonePocketOpening } from './clonePocketOpening'

const nameGenerator = new NameGenerator(EN.defaultNames)
const openings: PocketOpeningSchema[] = [
  { id: 'straight-source', type: 'straight', name: 'Opening' },
  {
    id: 'recessed-source',
    type: 'recessed',
    name: 'Opening',
    outerInset: 17,
    innerOffset: 11,
    outerRadius: 3,
    innerRadius: 4,
    depth: 8,
  },
  { id: 'slanted-source', type: 'slanted', name: 'Opening', offset: 13, side: 'end' },
  {
    id: 'optical-source',
    type: 'optical-illusion',
    name: 'Opening',
    direction: 'end',
    startInset: 7,
    endInset: 9,
    leadingRadius: 2,
    trailingRadius: 5,
  },
]

const fixture = (opening: PocketOpeningSchema): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['cluster'] }),
    components: [
      d.pocketCluster({ id: 'cluster', children: ['front', 'pocket'] }),
      d.frontPocket({ id: 'front', openingId: opening.id }),
      d.tPocket({ id: 'pocket', openingId: opening.id }),
    ],
    pocketOpenings: [opening, { id: 'following', type: 'straight', name: 'Following' }],
  })

describe('clonePocketOpening', () => {
  it.each(openings)('copies $type with a new ID and name', (opening) => {
    const source = fixture(opening)
    const snapshot = structuredClone(source)
    const result = clonePocketOpening(source, { openingId: opening.id, nameGenerator })
    const originalIds = getSubProjectIds(source)
    const copies = Object.values(result.pocketOpenings).filter((opening) => !originalIds.has(opening.id))
    expect(copies).toHaveLength(1)
    const cloned = copies[0]

    expect(cloned).toEqual({ ...opening, id: expect.any(String), name: 'Opening 1' })
    expect(cloned.id.startsWith(`${opening.type}-pocket-opening-`)).toBe(true)
    expect(Object.keys(result.pocketOpenings)).toHaveLength(Object.keys(source.pocketOpenings).length + 1)
    for (const id of Object.keys(source.pocketOpenings)) {
      expect(result.pocketOpenings[id]).toBe(source.pocketOpenings[id])
    }
    expect(result.defaultPocketOpening).toBe(source.defaultPocketOpening)
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(result.constraints).toBe(source.constraints)
    expect(accessors.subProject(result).component.frontPocket('front').openingId).toBe(opening.id)
    expect(accessors.subProject(result).component.tPocket('pocket').openingId).toBe(opening.id)
    expect(source).toEqual(snapshot)
  })

  it('avoids names used by other opening types when cloning a numbered name', () => {
    const opening: PocketOpeningSchema = { id: 'source', type: 'slanted', name: 'Opening 1', offset: 13, side: 'end' }
    const original = fixture(opening)
    const source: SubProjectSchema = {
      ...original,
      pocketOpenings: {
        ...original.pocketOpenings,
        occupied: { id: 'occupied', type: 'straight', name: 'Opening 2' },
      },
    }
    const result = clonePocketOpening(source, { openingId: opening.id, nameGenerator })
    const originalIds = getSubProjectIds(source)
    const copies = Object.values(result.pocketOpenings).filter((opening) => !originalIds.has(opening.id))
    expect(copies).toHaveLength(1)
    expect(copies[0].name).toBe('Opening 3')
    expect(source.pocketOpenings.source.name).toBe('Opening 1')
  })

  it('clones the default opening without changing which opening is the default', () => {
    const source = fixture(openings[0])
    const result = clonePocketOpening(source, { openingId: source.defaultPocketOpening, nameGenerator })
    expect(Object.keys(result.pocketOpenings)).toHaveLength(Object.keys(source.pocketOpenings).length + 1)
    expect(result.defaultPocketOpening).toBe(source.defaultPocketOpening)
    expect(result.pocketOpenings[source.defaultPocketOpening]).toBe(source.pocketOpenings[source.defaultPocketOpening])
  })

  it('keeps existing constraints on the source opening and pocket references unchanged', () => {
    const original = fixture(openings[1])
    const source: SubProjectSchema = {
      ...original,
      constraints: {
        depth: {
          id: 'depth',
          type: 'equal-constraint',
          fields: [
            { id: 'opening-depth', type: 'recessed-constraint-field', modelId: openings[1].id, field: 'depth' },
            { id: 'root-width', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
          ],
        },
        reference: {
          id: 'reference',
          type: 'equal-constraint',
          fields: [
            { id: 'front-opening', type: 'front-pocket-constraint-field', modelId: 'front', field: 'openingId' },
            { id: 'pocket-opening', type: 't-pocket-constraint-field', modelId: 'pocket', field: 'openingId' },
          ],
        },
      },
    }
    const snapshot = structuredClone(source)
    const result = clonePocketOpening(source, { openingId: openings[1].id, nameGenerator })
    expect(result.constraints).toBe(source.constraints)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('returns the same subproject for a missing source', () => {
    const source = fixture(openings[0])
    const snapshot = structuredClone(source)
    expect(clonePocketOpening(source, { openingId: 'missing', nameGenerator })).toBe(source)
    expect(source).toEqual(snapshot)
  })
})
