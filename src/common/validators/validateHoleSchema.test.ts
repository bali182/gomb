import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { EditableSchema } from '../schemas/editable'
import type { HoleSchema } from '../schemas/hole'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateHoleSchema } from './validateHoleSchema'

type ValidationFixture = {
  component: HoleSchema
  input: EditableSchema<HoleSchema>
  context: ComponentBasedValidationContextSchema
}

const createFixture = (): ValidationFixture => {
  const component = d.hole({ id: 'hole', componentId: 'root-front', width: 40, height: 60 })
  const root = d.rootPanel({ id: 'root' })
  const subProject = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front' }),
    id: 'sub-project',
    root,
    holes: [component],
  })
  const project = d.project({ id: 'project', subProjects: [subProject] })
  return {
    component,
    input: getEditableSchema(component, { language: 'en-GB' }),
    context: {
      language: 'en-GB',
      t: EN.validation,
      project,
      subProject,
      computedSubProject: getComputedSubProject(subProject, project.stitchingSettings),
    },
  }
}

describe('validateHoleSchema dimensions and stretch', () => {
  describe.each(['width', 'height'] as const)('%s', (field) => {
    it.each([true, false])('accepts zero with auto sizing %s', (auto) => {
      const { component, input, context } = createFixture()
      const result = validateHoleSchema(
        { ...input, autoWidth: auto, autoHeight: auto, [field]: '0' },
        component,
        context,
      )
      expect(result.isValid).toBe(true)
      expect(result.value?.autoWidth).toBe(auto)
      expect(result.value?.autoHeight).toBe(auto)
      expect(result.value?.[field]).toBe(0)
      expect(result.committedValue[field]).toBe(0)
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['0.25', '250'])('accepts non-negative size %s without a parent-size cap', (value) => {
      const { component, input, context } = createFixture()
      const result = validateHoleSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
    })

    it.each(['-1', '-0.25', '', '-', 'abc'])('rejects %s and retains the previous size', (value) => {
      const { component, input, context } = createFixture()
      const result = validateHoleSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
    })
  })

  describe.each(['topStretch', 'rightStretch', 'bottomStretch', 'leftStretch'] as const)('%s', (field) => {
    it.each(['-250', '-0.25', '0', '0.25', '250'])('accepts signed stretch %s', (value) => {
      const { component, input, context } = createFixture()
      const result = validateHoleSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['', '-', 'abc'])('rejects malformed stretch %s and preserves valid sibling changes', (value) => {
      const { component, input, context } = createFixture()
      const snapshot = structuredClone(component)
      const result = validateHoleSchema({ ...input, width: '80', [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
      expect(result.committedValue.width).toBe(80)
      expect(component).toEqual(snapshot)
    })
  })
})
