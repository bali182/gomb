import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { AnchorSchema } from '../schemas/common'
import type { PanelSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validatePanelSchema } from './validatePanelSchema'

type ValidationFixture = {
  component: PanelSchema
  input: EditableSchema<PanelSchema>
  context: ComponentBasedValidationContextSchema
}

const createFixture = (): ValidationFixture => {
  const component = d.panel({ id: 'child', width: 40, height: 60 })
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

describe('validatePanelSchema dimensions and stretch', () => {
  it.each<AnchorSchema>(['start', 'middle', 'end'])('accepts %s main-axis alignment', (mainAxisAnchor) => {
    const { component, input, context } = createFixture()
    const result = validatePanelSchema({ ...input, mainAxisAnchor }, component, context)
    expect(result.isValid).toBe(true)
    expect(result.value?.mainAxisAnchor).toBe(mainAxisAnchor)
    expect(result.committedValue.mainAxisAnchor).toBe(mainAxisAnchor)
    expect(result.issues.mainAxisAnchor).toBeUndefined()
  })

  it('rejects invalid main-axis alignment while committing other valid changes', () => {
    const { component, input, context } = createFixture()
    const result = validatePanelSchema(
      { ...input, mainAxisAnchor: 'invalid' as AnchorSchema, width: '80' },
      component,
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.issues.mainAxisAnchor?.severity).toBe('error')
    expect(result.committedValue.mainAxisAnchor).toBe(component.mainAxisAnchor)
    expect(result.committedValue.width).toBe(80)
  })
  describe.each(['width', 'height'] as const)('%s', (field) => {
    it.each([true, false])('accepts zero with auto sizing %s', (auto) => {
      const { component, input, context } = createFixture()
      const result = validatePanelSchema(
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
      const result = validatePanelSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
    })

    it.each(['-1', '-0.25', '', '-', 'abc'])('rejects %s and retains the previous size', (value) => {
      const { component, input, context } = createFixture()
      const result = validatePanelSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
    })
  })

  describe.each(['topStretch', 'rightStretch', 'bottomStretch', 'leftStretch'] as const)('%s', (field) => {
    it.each(['-250', '-0.25', '0', '0.25', '250'])('accepts signed stretch %s', (value) => {
      const { component, input, context } = createFixture()
      const result = validatePanelSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['', '-', 'abc'])('rejects malformed stretch %s and preserves valid sibling changes', (value) => {
      const { component, input, context } = createFixture()
      const snapshot = structuredClone(component)
      const result = validatePanelSchema({ ...input, width: '80', [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
      expect(result.committedValue.width).toBe(80)
      expect(component).toEqual(snapshot)
    })
  })
})
