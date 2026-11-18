import { describe, expect, it, vi } from 'vitest'
import type { ComponentInsertionPositionSchema, CreateComponentsFnParamsSchema } from '../../schemas/operations'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { narrowers } from '../../utils/narrowers'
import { addComponents } from './addComponents'
import { createBaseOperationParams } from './testUtils'

const fixture = () =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['first', 'second'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root', name: 'Panel 1' }),
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
      const result = addComponents(base, { parentId: 'root-front', position, createComponents })
      const added = Object.values(result.components).filter((component) => !sourceIds.has(component.id))
      const addedIds = added.map((component) => component.id)
      const index = position === 'start' ? 0 : position === 'end' ? 2 : position
      expect(
        accessors.subProject(result).component.childIds(accessors.subProject(result).component.rootPanel().frontFaceId),
      ).toEqual([
        ...accessors
          .subProject(source)
          .component.childIds(accessors.subProject(source).component.rootPanel().frontFaceId)
          .slice(0, index),
        ...addedIds,
        ...accessors
          .subProject(source)
          .component.childIds(accessors.subProject(source).component.rootPanel().frontFaceId)
          .slice(index),
      ])
      expect(added.map((component) => narrowers.assert.panel(component).name)).toEqual(['Panel 4', 'Panel 5'])
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
      expect(
        addComponents(createBaseOperationParams(source), { parentId: 'root-front', position, createComponents }),
      ).toBe(source)
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
        parentId: 'root-front',
        position: 'end',
        createComponents: () => [],
      }),
    ).toBe(source)
  })
})
