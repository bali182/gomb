import { describe, expect, it } from 'vitest'
import { createProject } from './createProject'

describe('createProject', () => {
  it('creates a prefixed ID for each new project', () => {
    const first = createProject('First')
    const second = createProject('Second')
    expect(first.id).toMatch(/^project-[a-zA-Z]{10}$/)
    expect(second.id).not.toBe(first.id)
  })
})
