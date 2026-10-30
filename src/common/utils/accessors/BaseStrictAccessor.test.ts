import { describe, expect, it } from 'vitest'
import { BaseStrictAccessor } from './BaseStrictAccessor'

class RequiredComponentAccessor extends BaseStrictAccessor {
  read(value: string | undefined): string {
    return this.requireResult(value, 'component')
  }
}

describe('BaseStrictAccessor', () => {
  it('returns an existing result, including falsy values', () => {
    const accessor = new RequiredComponentAccessor({ type: 'sub-project', id: 'sub' })
    expect(accessor.read('')).toBe('')
  })

  it('includes the missing element kind and owner context in one shared message', () => {
    const accessor = new RequiredComponentAccessor({ type: 'project', id: 'project', name: 'Wallet' })
    expect(() => accessor.read(undefined)).toThrow('Missing component from project project (Wallet).')
  })

  it('omits the owner name when it is absent', () => {
    const accessor = new RequiredComponentAccessor({ type: 'computed sub-project', id: 'sub' })
    expect(() => accessor.read(undefined)).toThrow('Missing component from computed sub-project sub.')
  })
})
