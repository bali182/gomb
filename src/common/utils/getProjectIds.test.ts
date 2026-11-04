import { describe, expect, it } from 'vitest'
import { getProjectIds } from './getProjectIds'

describe('getProjectIds', () => {
  it('collects every owned ID across subprojects without collecting references', () => {
    expect(
      getProjectIds({
        id: 'project',
        subProjects: [
          {
            id: 'sub',
            constraints: {
              constraint: { id: 'constraint', fields: [{ id: 'constraint-field', modelId: 'model-reference' }] },
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
        'constraint',
        'constraint-field',
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
            constraints: { empty: {}, partial: { fields: [{}] } },
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
