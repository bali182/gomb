import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { PocketClusterSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validatePocketClusterSchema } from './validatePocketClusterSchema'

type ValidationFixture = {
  component: PocketClusterSchema
  input: EditableSchema<PocketClusterSchema>
  context: ComponentBasedValidationContextSchema
}

const createFixture = (): ValidationFixture => {
  const component = d.pocketCluster({ id: 'child', width: 40, height: 60 })
  const root = d.rootPanel({ id: 'root', children: [component.id] })
  const subProject = d.subProject({ id: 'sub-project', root, components: [component] })
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

describe('validatePocketClusterSchema dimensions and stretch', () => {
  describe.each(['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] as const)(
    '%s',
    (field) => {
      it('keeps non-negative requested radii and the individual-radii setting', () => {
        const { component, input, context } = createFixture()
        const result = validatePocketClusterSchema(
          { ...input, [field]: '1000', individualRadii: true },
          component,
          context,
        )
        expect(result.isValid).toBe(true)
        expect(result.committedValue[field]).toBe(1000)
        expect(result.committedValue.individualRadii).toBe(true)
      })

      it.each(['-1', '', 'abc'])('rejects invalid radius %s while preserving valid edits', (value) => {
        const { component, input, context } = createFixture()
        const snapshot = structuredClone(component)
        const result = validatePocketClusterSchema({ ...input, [field]: value, width: '80' }, component, context)
        expect(result.isValid).toBe(false)
        expect(result.issues[field]?.severity).toBe('error')
        expect(result.committedValue[field]).toBe(component[field])
        expect(result.committedValue.width).toBe(80)
        expect(component).toEqual(snapshot)
      })
    },
  )

  describe.each(['width', 'height'] as const)('%s', (field) => {
    it.each([true, false])('accepts zero with auto sizing %s', (auto) => {
      const { component, input, context } = createFixture()
      const result = validatePocketClusterSchema(
        { ...input, autoWidth: auto, autoHeight: auto, [field]: '0' },
        component,
        context,
      )
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(0)
      expect(result.committedValue[field]).toBe(0)
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['0.25', '250'])('accepts non-negative size %s without a parent-size cap', (value) => {
      const { component, input, context } = createFixture()
      const result = validatePocketClusterSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
    })

    it.each(['-1', '-0.25', '', '-', 'abc'])('rejects %s and retains the previous size', (value) => {
      const { component, input, context } = createFixture()
      const result = validatePocketClusterSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
    })
  })

  describe.each(['topStretch', 'rightStretch', 'bottomStretch', 'leftStretch'] as const)('%s', (field) => {
    it.each(['-250', '-0.25', '0', '0.25', '250'])('accepts signed stretch %s', (value) => {
      const { component, input, context } = createFixture()
      const result = validatePocketClusterSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['', '-', 'abc'])('rejects malformed stretch %s and preserves valid sibling changes', (value) => {
      const { component, input, context } = createFixture()
      const snapshot = structuredClone(component)
      const result = validatePocketClusterSchema({ ...input, width: '80', [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
      expect(result.committedValue.width).toBe(80)
      expect(component).toEqual(snapshot)
    })
  })
})
