import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { AnchorSchema } from '../schemas/common'
import type { GuideSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateGuideSchema } from './validateGuideSchema'

type ValidationFixture = {
  component: GuideSchema
  input: EditableSchema<GuideSchema>
  context: ComponentBasedValidationContextSchema
}

const createFixture = (): ValidationFixture => {
  const component = d.guide({ id: 'child', width: 40, height: 60 })
  const root = d.rootPanel({ id: 'root' })
  const subProject = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: [component.id] }),
    id: 'sub-project',
    root,
    components: [component],
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

describe('validateGuideSchema dimensions and stretch', () => {
  it.each<AnchorSchema>(['start', 'middle', 'end'])('accepts %s main-axis alignment', (mainAxisAnchor) => {
    const { component, input, context } = createFixture()
    const result = validateGuideSchema({ ...input, mainAxisAnchor }, component, context)
    expect(result.isValid).toBe(true)
    expect(result.value?.mainAxisAnchor).toBe(mainAxisAnchor)
    expect(result.committedValue.mainAxisAnchor).toBe(mainAxisAnchor)
    expect(result.issues.mainAxisAnchor).toBeUndefined()
  })

  it('rejects invalid main-axis alignment while committing other valid changes', () => {
    const { component, input, context } = createFixture()
    const result = validateGuideSchema(
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
      const result = validateGuideSchema(
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
      const result = validateGuideSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
    })

    it.each(['-1', '-0.25', '', '-', 'abc'])('rejects %s and retains the previous size', (value) => {
      const { component, input, context } = createFixture()
      const result = validateGuideSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
    })
  })

  describe.each(['topStretch', 'rightStretch', 'bottomStretch', 'leftStretch'] as const)('%s', (field) => {
    it.each(['-250', '-0.25', '0', '0.25', '250'])('accepts signed stretch %s', (value) => {
      const { component, input, context } = createFixture()
      const result = validateGuideSchema({ ...input, [field]: value }, component, context)
      expect(result.isValid).toBe(true)
      expect(result.value?.[field]).toBe(Number(value))
      expect(result.issues[field]).toBeUndefined()
    })

    it.each(['', '-', 'abc'])('rejects malformed stretch %s and preserves valid sibling changes', (value) => {
      const { component, input, context } = createFixture()
      const snapshot = structuredClone(component)
      const result = validateGuideSchema({ ...input, width: '80', [field]: value }, component, context)
      expect(result.isValid).toBe(false)
      expect(result.issues[field]?.severity).toBe('error')
      expect(result.committedValue[field]).toBe(component[field])
      expect(result.committedValue.width).toBe(80)
      expect(component).toEqual(snapshot)
    })
  })
})

it('rejects a Guide name already used by a face', () => {
  const { component, input, context } = createFixture()
  const result = validateGuideSchema({ ...input, name: 'root-front' }, component, context)
  expect(result.isValid).toBe(false)
  expect(result.issues.name?.message).toBe(EN.validation.name.duplicate)
  expect(result.committedValue.name).toBe(component.name)
})

it('rejects invalid anchored positions while retaining other valid edits', () => {
  const { component, input, context } = createFixture()
  const result = validateGuideSchema(
    { ...input, xAnchor: 'invalid' as AnchorSchema, yOffset: 'oops', xOffset: '-5', leftStretch: '-12' },
    component,
    context,
  )
  expect(result.isValid).toBe(false)
  expect(result.issues.xAnchor?.severity).toBe('error')
  expect(result.issues.yOffset?.severity).toBe('error')
  expect(result.committedValue.xAnchor).toBe(component.xAnchor)
  expect(result.committedValue.yOffset).toBe(component.yOffset)
  expect(result.committedValue.xOffset).toBe(-5)
  expect(result.committedValue.leftStretch).toBe(-12)
})
