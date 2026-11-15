import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening, defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type {
  OpticalIllusionPocketOpeningOwnSchema,
  OpticalIllusionPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from '../schemas/pocketOpening'
import type { DeepPartialSchema, NumericFieldNameSchema } from '../schemas/utils'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validatePocketOpeningSchema } from './validatePocketOpeningSchema'

const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
const context: ComponentBasedValidationContextSchema = {
  language: 'en-GB',
  t: EN.validation,
  subProject,
  project: d.project({ id: 'project', subProjects: [subProject] }),
  computedSubProject: getComputedSubProject(subProject, defaultStitchingSettings),
}
const optical: OpticalIllusionPocketOpeningSchema = {
  type: 'optical-illusion',
  ...defaultOpticalIllusionPocketOpening,
  id: 'optical',
  name: 'Optical',
}

const slanted: SlantedPocketOpeningSchema = {
  id: 'opening',
  name: 'Opening',
  type: 'slanted',
  slantOffset: 15,
  slantSide: 'end',
}

describe('validatePocketOpeningSchema', () => {
  it('rejects changing an opening type', () => {
    const current: StraightPocketOpeningSchema = { id: 'opening', name: 'Opening', type: 'straight' }
    const input: EditableSchema<SlantedPocketOpeningSchema> = getEditableSchema(slanted, { language: 'en-GB' })
    const result = validatePocketOpeningSchema(input, current, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(current)
  })
  it.each(['0', '-1', '', '-', 'abc'])('rejects invalid offset %s while retaining valid side changes', (offset) => {
    const input: EditableSchema<SlantedPocketOpeningSchema> = {
      ...getEditableSchema(slanted, { language: 'en-GB' }),
      slantOffset: offset,
      slantSide: 'start',
    }
    const result = validatePocketOpeningSchema(input, slanted, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({
      slantOffset: { severity: 'error' },
    } satisfies DeepPartialSchema<IssuesSchema<SlantedPocketOpeningSchema>>)
    expect(result.committedValue).toEqual({ ...slanted, slantSide: 'start' } satisfies SlantedPocketOpeningSchema)
  })
  it('rejects an unknown side without losing the previous value', () => {
    const input: EditableSchema<SlantedPocketOpeningSchema> = getEditableSchema(slanted, { language: 'en-GB' })
    const field: keyof SlantedPocketOpeningSchema = 'slantSide'
    Reflect.set(input, field, 'unknown')
    const result = validatePocketOpeningSchema(input, slanted, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(slanted)
  })
})

describe('optical illusion opening validation', () => {
  it('accepts all zero numeric fields', () => {
    const value: OpticalIllusionPocketOpeningSchema = {
      ...optical,
      illusionStartInset: 0,
      illusionEndInset: 0,
      illusionLeadingRadius: 0,
      illusionTrailingRadius: 0,
    }
    const result = validatePocketOpeningSchema(getEditableSchema(value, { language: 'en-GB' }), value, context)
    expect(result.isValid).toBe(true)
    expect(result.value).toEqual(value)
  })
  it.each<NumericFieldNameSchema<OpticalIllusionPocketOpeningOwnSchema>>([
    'illusionStartInset',
    'illusionEndInset',
    'illusionLeadingRadius',
    'illusionTrailingRadius',
  ])('retains %s on invalid input while committing side', (field) => {
    const input: EditableSchema<OpticalIllusionPocketOpeningSchema> = getEditableSchema(optical, { language: 'en-GB' })
    input[field] = '-1'
    input.illusionSide = 'start'
    const result = validatePocketOpeningSchema(input, optical, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({
      [field]: { severity: 'error' },
    } satisfies DeepPartialSchema<IssuesSchema<OpticalIllusionPocketOpeningSchema>>)
    expect(result.committedValue).toEqual({
      ...optical,
      illusionSide: 'start',
    } satisfies OpticalIllusionPocketOpeningSchema)
  })
  it('rejects an unknown side', () => {
    const input: EditableSchema<OpticalIllusionPocketOpeningSchema> = getEditableSchema(optical, { language: 'en-GB' })
    const field: keyof OpticalIllusionPocketOpeningSchema = 'illusionSide'
    Reflect.set(input, field, 'unknown')
    const result = validatePocketOpeningSchema(input, optical, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({
      illusionSide: { severity: 'error' },
    } satisfies DeepPartialSchema<IssuesSchema<OpticalIllusionPocketOpeningSchema>>)
  })
})

it.each(['', 'Taken'])('rejects invalid opening name %s while committing valid parameters', (name) => {
  const taken: StraightPocketOpeningSchema = { id: 'taken', name: 'Taken', type: 'straight' }
  const validationContext: ComponentBasedValidationContextSchema = {
    ...context,
    subProject: {
      ...subProject,
      pocketOpenings: { ...subProject.pocketOpenings, [slanted.id]: slanted, [taken.id]: taken },
    },
  }
  const input: EditableSchema<SlantedPocketOpeningSchema> = {
    ...getEditableSchema(slanted, { language: 'en-GB' }),
    name,
    slantOffset: '21',
  }
  const result = validatePocketOpeningSchema(input, slanted, validationContext)
  expect(result.isValid).toBe(false)
  expect(result.issues).toMatchObject({
    name: { severity: 'error' },
  } satisfies DeepPartialSchema<IssuesSchema<SlantedPocketOpeningSchema>>)
  expect(result.committedValue).toEqual({ ...slanted, slantOffset: 21 } satisfies SlantedPocketOpeningSchema)
})

it('accepts a unique name and preserves the current opening identity', () => {
  const input: EditableSchema<SlantedPocketOpeningSchema> = {
    ...getEditableSchema(slanted, { language: 'en-GB' }),
    id: 'replacement',
    name: 'Renamed',
  }
  const result = validatePocketOpeningSchema(input, slanted, context)
  expect(result.isValid).toBe(true)
  expect(result.committedValue).toEqual({ ...slanted, name: 'Renamed' } satisfies SlantedPocketOpeningSchema)
})
