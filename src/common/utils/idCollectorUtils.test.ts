import { describe, expect, it } from 'vitest'
import { getProjectIds, getSubProjectIds } from './idCollectorUtils'

describe('getProjectIds', () => {
  it('collects every owned ID across subprojects without collecting references', () => {
    expect(
      getProjectIds({
        id: 'project',
        subProjects: [
          {
            id: 'sub',
            bindings: {
              binding: { id: 'binding', fields: [{ id: 'binding-field', modelId: 'model-reference' }] },
            },
            root: 'root-reference',
            defaultPocketOpening: 'opening-reference',
            components: { key: { id: 'component', children: ['child-reference'], itemId: 'ID-1' } },
            holes: [{ id: 'hole', componentId: 'owner-reference' }],
            stitchLines: [{ id: 'stitch', targetId: 'target-reference', onTop: 'onTop-reference' }],
            pocketOpenings: { key: { id: 'opening' } },
          },
          { id: 'other-sub', components: { key: { id: 'other-component' } } },
        ],
      }),
    ).toEqual(
      new Set([
        'project',
        'sub',
        'binding',
        'binding-field',
        'component',
        'hole',
        'stitch',
        'opening',
        'other-sub',
        'other-component',
      ]),
    )
  })

  it('accepts incomplete migration input', () => {
    expect(getProjectIds({})).toEqual(new Set())
    expect(
      getProjectIds({
        subProjects: [
          {
            bindings: { empty: {}, partial: { fields: [{}] } },
            components: { empty: {} },
            holes: [{}],
            stitchLines: [{}],
            pocketOpenings: { empty: {} },
          },
        ],
      }),
    ).toEqual(new Set())
  })
})

describe('getSubProjectIds', () => {
  it('collects owned IDs without references and appends to the supplied set', () => {
    const ids = new Set(['existing'])
    const result = getSubProjectIds(
      {
        id: 'sub',
        root: 'root-reference',
        defaultPocketOpening: 'opening-reference',
        bindings: { binding: { id: 'binding', fields: [{ id: 'member', modelId: 'model-reference' }] } },
        components: { component: { id: 'component', children: ['child-reference'], itemId: 'ID-1' } },
        holes: [{ id: 'hole', componentId: 'owner-reference' }],
        stitchLines: [{ id: 'stitch', targetId: 'target-reference', onTop: 'onTop-reference' }],
        pocketOpenings: { opening: { id: 'opening' } },
      },
      ids,
    )
    expect(result).toBe(ids)
    expect(result).toEqual(new Set(['existing', 'sub', 'binding', 'member', 'component', 'hole', 'stitch', 'opening']))
  })

  it('accepts incomplete input', () => {
    expect(getSubProjectIds({})).toEqual(new Set())
    expect(
      getSubProjectIds({
        bindings: { empty: {}, partial: { fields: [{}] } },
        components: { empty: {} },
        holes: [{}],
        stitchLines: [{}],
        pocketOpenings: { empty: {} },
      }),
    ).toEqual(new Set())
  })
})

it('appends all project IDs to the supplied set', () => {
  const ids = new Set(['existing'])
  expect(getProjectIds({ id: 'project', subProjects: [{ id: 'sub' }, { id: 'sub' }] }, ids)).toBe(ids)
  expect(ids).toEqual(new Set(['existing', 'project', 'sub']))
})
