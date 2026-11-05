import { describe, expect, it } from 'vitest'
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
