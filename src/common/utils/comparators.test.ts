import { describe, expect, it } from 'vitest'
import type { HasCornerRadiusValuesSchema } from '../schemas/common'
import type { ConstraintFieldSchema, ConstraintSchema } from '../schemas/constraints'
import { d } from '../testData'
import { comparators } from './comparators'

const field: ConstraintFieldSchema = { id: 'field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' }
const constraint: ConstraintSchema = {
  id: 'constraint',
  type: 'equal-constraint',
  fields: [field, { ...field, id: 'other', field: 'height' }],
}

describe('constraint comparators', () => {
  it('compares equal values independently of object identity', () => {
    expect(comparators.constraint(constraint, structuredClone(constraint))).toBe(true)
    expect(comparators.constraintField(field, { ...field })).toBe(true)
  })
  const changedFields: ConstraintFieldSchema[] = [
    { ...field, id: 'changed' },
    { ...field, modelId: 'other-panel' },
    { ...field, field: 'height' },
    { ...field, type: 'root-panel-constraint-field', field: 'width' },
  ]
  it.each(changedFields)('detects changed member $id/$modelId/$field/$type', (changed) => {
    expect(comparators.constraintField(field, changed)).toBe(false)
    expect(comparators.constraint(constraint, { ...constraint, fields: [changed, constraint.fields[1]] })).toBe(false)
  })
  it('detects changed constraint IDs, member counts and member order', () => {
    expect(comparators.constraint(constraint, { ...constraint, id: 'changed' })).toBe(false)
    expect(comparators.constraint(constraint, { ...constraint, fields: [field] })).toBe(false)
    expect(comparators.constraint(constraint, { ...constraint, fields: [...constraint.fields].reverse() })).toBe(false)
  })
  it('includes constraint-only edits in project comparison and ignores record insertion order', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      constraints: { first: constraint, second: { ...constraint, id: 'second' } },
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    expect(
      comparators.subProject(subProject, {
        ...subProject,
        constraints: { second: subProject.constraints.second, first: constraint },
      }),
    ).toBe(true)
    const variants: Record<string, ConstraintSchema>[] = [
      {},
      { first: constraint },
      { first: constraint, other: subProject.constraints.second },
      { ...subProject.constraints, first: { ...constraint, fields: [field] } },
    ]
    for (const constraints of variants) {
      const updated = { ...subProject, constraints }
      expect(comparators.subProject(subProject, updated)).toBe(false)
      expect(comparators.project(project, { ...project, subProjects: [updated] })).toBe(false)
    }
  })
})

describe('input model comparators', () => {
  const cornerFields: (keyof HasCornerRadiusValuesSchema)[] = [
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

  it('detects radius mode and layout anchor changes', () => {
    const root = d.rootPanel({ id: 'root', mainAxisAnchor: 'start' })
    const panel = d.panel({ id: 'panel', mainAxisAnchor: 'start' })
    const front = d.frontPocket({ id: 'front', mainAxisAnchor: 'start' })
    const hole = d.hole({ id: 'hole', componentId: 'panel' })
    expect(comparators.rootPanel(root, { ...root, individualRadii: !root.individualRadii })).toBe(false)
    expect(comparators.panel(panel, { ...panel, individualRadii: !panel.individualRadii })).toBe(false)
    expect(comparators.hole(hole, { ...hole, individualRadii: !hole.individualRadii })).toBe(false)
    expect(comparators.rootPanel(root, { ...root, mainAxisAnchor: 'end' })).toBe(false)
    expect(comparators.panel(panel, { ...panel, mainAxisAnchor: 'end' })).toBe(false)
    expect(comparators.frontPocket(front, { ...front, mainAxisAnchor: 'end' })).toBe(false)
  })

  it('detects render-target and disconnected-corner changes', () => {
    const stitchLine = d.componentBoundsStitchLine({ id: 'stitch', targetId: 'root', targetType: 'component' })
    const variants = [
      { ...stitchLine, onTop: 'panel' },
      { ...stitchLine, stitchDisconnectedTopLeftCorner: !stitchLine.stitchDisconnectedTopLeftCorner },
      { ...stitchLine, stitchDisconnectedTopRightCorner: !stitchLine.stitchDisconnectedTopRightCorner },
      { ...stitchLine, stitchDisconnectedBottomLeftCorner: !stitchLine.stitchDisconnectedBottomLeftCorner },
      { ...stitchLine, stitchDisconnectedBottomRightCorner: !stitchLine.stitchDisconnectedBottomRightCorner },
    ]
    for (const variant of variants) {
      expect(comparators.stitchLine(stitchLine, variant)).toBe(false)
    }
  })
})
