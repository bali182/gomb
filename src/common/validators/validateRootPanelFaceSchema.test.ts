import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { RootPanelFaceSchema } from '../schemas/components'
import type { EditableSchema } from '../schemas/editable'
import type { ComponentBasedValidationContextSchema } from '../schemas/validation'
import { d } from '../testData'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateRootPanelFaceSchema } from './validateRootPanelFaceSchema'

type ValidationFixture = {
  component: RootPanelFaceSchema
  input: EditableSchema<RootPanelFaceSchema>
  context: ComponentBasedValidationContextSchema
}

const createFixture = (): ValidationFixture => {
  const root = d.rootPanel({ id: 'root' })
  const component = d.rootPanelFace({ id: root.frontFaceId })
  const subProject = d.subProject({ id: 'sub-project', root, frontFace: component })
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

describe('validateRootPanelFaceSchema color', () => {
  it('accepts a face without an explicit color', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema(input, component, context)
    expect(result.isValid).toBe(true)
    expect(result.issues.color).toBeUndefined()
    expect(result.value).not.toHaveProperty('color')
    expect(result.committedValue).not.toHaveProperty('color')
  })

  it.each(['#123456', '#12345678'])('accepts %s as a new face color', (color) => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema({ ...input, color }, component, context)
    expect(result.isValid).toBe(true)
    expect(result.issues.color).toBeUndefined()
    expect(result.value?.color).toBe(color)
    expect(result.committedValue.color).toBe(color)
  })

  it('replaces an existing color', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema(
      { ...input, color: '#abcdef' },
      { ...component, color: '#123456' },
      context,
    )
    expect(result.isValid).toBe(true)
    expect(result.value?.color).toBe('#abcdef')
    expect(result.committedValue.color).toBe('#abcdef')
  })

  it('removes the color property when resetting to inherited color', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema(input, { ...component, color: '#123456' }, context)
    expect(result.isValid).toBe(true)
    expect(result.value).not.toHaveProperty('color')
    expect(result.committedValue).not.toHaveProperty('color')
  })

  it('preserves the previous valid color when the input is invalid', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema(
      { ...input, color: '#invalid' },
      { ...component, color: '#123456' },
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.issues.color?.severity).toBe('error')
    expect(result.committedValue.color).toBe('#123456')
  })

  it('does not introduce a color property for invalid input without a previous color', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema({ ...input, color: '#invalid' }, component, context)
    expect(result.isValid).toBe(false)
    expect(result.issues.color?.severity).toBe('error')
    expect(result.committedValue).not.toHaveProperty('color')
  })

  it('commits valid name and layout changes alongside an invalid color', () => {
    const { component, input, context } = createFixture()
    const result = validateRootPanelFaceSchema(
      {
        ...input,
        color: '#invalid',
        name: 'Renamed face',
        layoutOrientation: 'vertical',
        mainAxisAnchor: 'end',
        layoutGap: '7',
      },
      { ...component, color: '#123456' },
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.issues.color?.severity).toBe('error')
    expect(result.committedValue).toMatchObject({
      color: '#123456',
      name: 'Renamed face',
      layoutOrientation: 'vertical',
      mainAxisAnchor: 'end',
      layoutGap: 7,
    })
  })
})
