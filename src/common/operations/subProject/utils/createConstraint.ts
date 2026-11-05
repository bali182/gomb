import type { ConstraintSchema } from '../../../schemas/constraints'

export const createConstraint = (id: string): ConstraintSchema => ({
  id,
  type: 'constraint',
  relation: 'equal',
  fields: [],
})
