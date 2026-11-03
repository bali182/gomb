import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening, defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { SlantedPocketOpeningSchema } from '../schemas/pocketOpening'
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
const optical = {
  type: 'optical-illusion' as const,
  ...defaultOpticalIllusionPocketOpening,
  id: 'optical',
  name: 'Optical',
}

const slanted: SlantedPocketOpeningSchema = { id: 'opening', name: 'Opening', type: 'slanted', offset: 15, side: 'end' }
describe('validatePocketOpeningSchema', () => {
  it('rejects changing an opening type', () => {
    const result = validatePocketOpeningSchema(
      getEditableSchema(slanted, { language: 'en-GB' }),
      { id: 'opening', name: 'Opening', type: 'straight' },
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual({ id: 'opening', name: 'Opening', type: 'straight' })
  })
  it.each(['0', '-1', '', '-', 'abc'])('rejects invalid offset %s while retaining valid side changes', (offset) => {
    const result = validatePocketOpeningSchema(
      { id: 'opening', name: 'Opening', type: 'slanted', offset, side: 'start' },
      slanted,
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({ offset: { severity: 'error' } })
    expect(result.committedValue).toEqual({ ...slanted, side: 'start' })
  })
  it('rejects an unknown side without losing the previous value', () => {
    const input = getEditableSchema(slanted, { language: 'en-GB' })
    Reflect.set(input, 'side', 'unknown')
    const result = validatePocketOpeningSchema(input, slanted, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(slanted)
  })
})

describe('optical illusion opening validation', () => {
  it('accepts all zero numeric fields', () => {
    const value = {
      ...optical,
      startInset: 0,
      endInset: 0,
      leadingRadius: 0,
      trailingRadius: 0,
    }
    const result = validatePocketOpeningSchema(getEditableSchema(value, { language: 'en-GB' }), value, context)
    expect(result.isValid).toBe(true)
    expect(result.value).toEqual(value)
  })
  it.each(['startInset', 'endInset', 'leadingRadius', 'trailingRadius'] as const)(
    'retains %s on invalid input while committing direction',
    (field) => {
      const input = getEditableSchema(optical, { language: 'en-GB' })
      input[field] = '-1'
      input.direction = 'start'
      const result = validatePocketOpeningSchema(input, optical, context)
      expect(result.isValid).toBe(false)
      expect(result.issues).toMatchObject({ [field]: { severity: 'error' } })
      expect(result.committedValue).toEqual({ ...optical, direction: 'start' })
    },
  )
  it('rejects an unknown direction', () => {
    const input = getEditableSchema(optical, { language: 'en-GB' })
    Reflect.set(input, 'direction', 'unknown')
    const result = validatePocketOpeningSchema(input, optical, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({ direction: { severity: 'error' } })
  })
})

it.each(['', 'Taken'])('rejects invalid opening name %s while committing valid parameters', (name) => {
  const taken = { id: 'taken', name: 'Taken', type: 'straight' } as const
  const validationContext: ComponentBasedValidationContextSchema = {
    ...context,
    subProject: {
      ...subProject,
      pocketOpenings: { ...subProject.pocketOpenings, [slanted.id]: slanted, [taken.id]: taken },
    },
  }
  const input = { ...getEditableSchema(slanted, { language: 'en-GB' }), name, offset: '21' }
  const result = validatePocketOpeningSchema(input, slanted, validationContext)
  expect(result.isValid).toBe(false)
  expect(result.issues).toMatchObject({ name: { severity: 'error' } })
  expect(result.committedValue).toEqual({ ...slanted, offset: 21 })
})

it('accepts a unique name and preserves the current opening identity', () => {
  const result = validatePocketOpeningSchema(
    { ...getEditableSchema(slanted, { language: 'en-GB' }), id: 'replacement', name: 'Renamed' },
    slanted,
    context,
  )
  expect(result.isValid).toBe(true)
  expect(result.committedValue).toEqual({ ...slanted, name: 'Renamed' })
})
