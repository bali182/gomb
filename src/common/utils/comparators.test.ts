import { describe, expect, it } from 'vitest'
import { defaultRecessedPocketOpening } from '../defaultStates'
import type { BindingFieldSchema, BindingSchema } from '../schemas/bindings'
import type { HasCornerRadiusSchema } from '../schemas/common'
import type { RecessedPocketOpeningSchema } from '../schemas/pocketOpening'
import { d } from '../testData'
import { comparators } from './comparators'

describe('recessed opening margin comparison', () => {
  const opening: RecessedPocketOpeningSchema = {
    ...defaultRecessedPocketOpening,
    id: 'opening',
    name: 'Opening',
    type: 'recessed',
  }
  it('compares equal values independently of identity', () => {
    expect(comparators.pocketOpening(opening, { ...opening })).toBe(true)
  })
  it.each(['recessStartMargin', 'recessEndMargin'] as const)('detects a changed %s', (field) => {
    expect(comparators.pocketOpening(opening, { ...opening, [field]: 5 })).toBe(false)
  })
})

const field: BindingFieldSchema = { id: 'field', type: 'panel-binding-field', modelId: 'panel', field: 'width' }
const binding: BindingSchema = {
  id: 'binding',
  type: 'equal-binding',
  fields: [field, { ...field, id: 'other', field: 'height' }],
}

describe('binding comparators', () => {
  it('compares equal values independently of object identity', () => {
    expect(comparators.binding(binding, structuredClone(binding))).toBe(true)
    expect(comparators.bindingField(field, { ...field })).toBe(true)
  })
  const changedFields: BindingFieldSchema[] = [
    { ...field, id: 'changed' },
    { ...field, modelId: 'other-panel' },
    { ...field, field: 'height' },
    { ...field, type: 'root-panel-binding-field', field: 'width' },
  ]
  it.each(changedFields)('detects changed member $id/$modelId/$field/$type', (changed) => {
    expect(comparators.bindingField(field, changed)).toBe(false)
    expect(comparators.binding(binding, { ...binding, fields: [changed, binding.fields[1]] })).toBe(false)
  })
  it('detects changed binding IDs, member counts and member order', () => {
    expect(comparators.binding(binding, { ...binding, id: 'changed' })).toBe(false)
    expect(comparators.binding(binding, { ...binding, fields: [field] })).toBe(false)
    expect(comparators.binding(binding, { ...binding, fields: [...binding.fields].reverse() })).toBe(false)
  })
  it('includes binding-only edits in project comparison and ignores record insertion order', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      bindings: { first: binding, second: { ...binding, id: 'second' } },
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    expect(
      comparators.subProject(subProject, {
        ...subProject,
        bindings: { second: subProject.bindings.second, first: binding },
      }),
    ).toBe(true)
    const variants: Record<string, BindingSchema>[] = [
      {},
      { first: binding },
      { first: binding, other: subProject.bindings.second },
      { ...subProject.bindings, first: { ...binding, fields: [field] } },
    ]
    for (const bindings of variants) {
      const updated = { ...subProject, bindings }
      expect(comparators.subProject(subProject, updated)).toBe(false)
      expect(comparators.project(project, { ...project, subProjects: [updated] })).toBe(false)
    }
  })
})

describe('input model comparators', () => {
  it('recognizes unchanged Guides through the component comparator used by the editor', () => {
    const guide = d.guide({ id: 'guide' })
    expect(comparators.component(guide, guide)).toBe(true)
    expect(comparators.component(guide, { ...guide, children: [...guide.children] })).toBe(true)
    expect(comparators.component(guide, { ...guide, xOffset: 10 })).toBe(false)
    expect(comparators.component(guide, { ...guide, autoWidth: false })).toBe(false)
    expect(comparators.component(guide, { ...guide, leftStretch: 5 })).toBe(false)
    expect(comparators.component(guide, { ...guide, children: ['child'] })).toBe(false)
  })

  const cornerFields: (keyof HasCornerRadiusSchema)[] = [
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
  ]

  it.each(cornerFields)('detects a change to %s in every model with radii', (field) => {
    const root = d.rootPanel({ id: 'root' })
    const panel = d.panel({ id: 'panel' })
    const hole = d.hole({ id: 'hole', componentId: 'panel' })
    expect(comparators.rootPanel(root, { ...root, [field]: root[field] + 1 })).toBe(false)
    expect(comparators.panel(panel, { ...panel, [field]: panel[field] + 1 })).toBe(false)
    expect(comparators.hole(hole, { ...hole, [field]: hole[field] + 1 })).toBe(false)
  })

  it('detects layout anchor changes', () => {
    const root = d.rootPanelFace({ id: 'root-front', mainAxisAnchor: 'start' })
    const panel = d.panel({ id: 'panel', mainAxisAnchor: 'start' })
    const front = d.frontPocket({ id: 'front', mainAxisAnchor: 'start' })
    expect(comparators.rootPanelFace(root, { ...root, mainAxisAnchor: 'end' })).toBe(false)
    expect(comparators.panel(panel, { ...panel, mainAxisAnchor: 'end' })).toBe(false)
    expect(comparators.frontPocket(front, { ...front, mainAxisAnchor: 'end' })).toBe(false)
  })

  it('detects render-target, offset and route direction changes', () => {
    const stitchLine = d.componentBoundsStitchLine({ id: 'stitch', targetId: 'root-front', targetType: 'component' })
    const variants = [
      { ...stitchLine, entryComponentId: 'panel' },
      { ...stitchLine, exitComponentId: 'panel' },
      { ...stitchLine, startOffset: 1 },
      { ...stitchLine, endOffset: 2 },
      { ...stitchLine, stitchDirection: 'end-to-start' as const },
    ]
    for (const variant of variants) {
      expect(comparators.stitchLine(stitchLine, variant)).toBe(false)
    }
  })
})

describe('root panel face identity and color comparison', () => {
  const face = d.rootPanelFace({ id: 'root-front', color: '#123456' })

  it('recognizes unchanged faces independently of object identity', () => {
    const unchanged = { ...face, children: [...face.children] }
    expect(comparators.rootPanelFace(face, unchanged)).toBe(true)
    expect(comparators.component(face, unchanged)).toBe(true)
  })

  const withoutColor = d.rootPanelFace({ id: face.id })
  const changes = [
    { name: 'name', before: face, after: { ...face, name: 'Renamed face' } },
    { name: 'added color', before: withoutColor, after: face },
    { name: 'changed color', before: face, after: { ...face, color: '#abcdef' } },
    { name: 'removed color', before: face, after: withoutColor },
  ]

  it.each(changes)('detects $name changes through every enclosing comparator', ({ before, after }) => {
    const subProject = d.subProject({ id: 'sub-project', root: d.rootPanel({ id: 'root' }), frontFace: before })
    const updatedSubProject = { ...subProject, components: { ...subProject.components, [after.id]: after } }
    const project = d.project({ id: 'project', subProjects: [subProject] })
    expect(comparators.rootPanelFace(before, after)).toBe(false)
    expect(comparators.component(before, after)).toBe(false)
    expect(comparators.subProject(subProject, updatedSubProject)).toBe(false)
    expect(comparators.project(project, { ...project, subProjects: [updatedSubProject] })).toBe(false)
  })
})
