import { describe, expect, it, vi } from 'vitest'
import type { ComponentInsertionPositionSchema, CreateComponentsFnParamsSchema } from '../../schemas/operations'
import { d } from '../../testData'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { addComponents } from './addComponents'
import { createBaseOperationParams } from './testUtils'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', name: 'Panel 1', children: ['first', 'second'] }),
    components: [d.panel({ id: 'first', name: 'Panel 2' }), d.panel({ id: 'second', name: 'Panel 3' })],
  })

describe('addComponents', () => {
  it.each<ComponentInsertionPositionSchema>(['start', 'end', 1])(
    'inserts the whole batch at %s in order',
    (position) => {
      const source = fixture()
      const snapshot = structuredClone(source)
      const sourceIds = getSubProjectIds(source)
      const base = createBaseOperationParams(source)
      const createComponents = vi.fn(({ factory, forbiddenIds, forbiddenNames }: CreateComponentsFnParamsSchema) => [
        factory.createComponent({
          type: 'panel',
          forbiddenIds,
          forbiddenNames,
          stitchingSettings: base.project.stitchingSettings,
        }),
        factory.createComponent({
          type: 'panel',
          forbiddenIds,
          forbiddenNames,
          stitchingSettings: base.project.stitchingSettings,
        }),
      ])
      const result = addComponents(base, { parentId: 'root', position, createComponents })
      const added = Object.values(result.components).filter((component) => !sourceIds.has(component.id))
      const addedIds = added.map((component) => component.id)
      const index = position === 'start' ? 0 : position === 'end' ? 2 : position
      expect(result.components.root.children).toEqual([
        ...source.components.root.children.slice(0, index),
        ...addedIds,
        ...source.components.root.children.slice(index),
      ])
      expect(added.map((component) => component.name)).toEqual(['Panel 4', 'Panel 5'])
      expect(new Set(addedIds).size).toBe(2)
      for (const component of added) {
        expect(sourceIds.has(component.id)).toBe(false)
        expect(result.components[component.id]).toBe(component)
      }
      expect(createComponents).toHaveBeenCalledTimes(1)
      expect(result.components.first).toBe(source.components.first)
      expect(source).toEqual(snapshot)
    },
  )

  it.each([-1, 3, 0.5, NaN, Infinity, -Infinity])(
    'rejects invalid position %s before creating the batch',
    (position) => {
      const source = fixture()
      const createComponents = vi.fn(() => [])
      expect(addComponents(createBaseOperationParams(source), { parentId: 'root', position, createComponents })).toBe(
        source,
      )
      expect(createComponents).not.toHaveBeenCalled()
    },
  )

  it('rejects a missing parent before creating the batch', () => {
    const source = fixture()
    const createComponents = vi.fn(() => [])
    expect(() =>
      addComponents(createBaseOperationParams(source), { parentId: 'missing', position: 'end', createComponents }),
    ).toThrow('Missing parent')
    expect(createComponents).not.toHaveBeenCalled()
  })

  it('returns the original snapshot for an empty batch', () => {
    const source = fixture()
    expect(
      addComponents(createBaseOperationParams(source), {
        parentId: 'root',
        position: 'end',
        createComponents: () => [],
      }),
    ).toBe(source)
  })
})
