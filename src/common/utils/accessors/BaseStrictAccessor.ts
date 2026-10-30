import type { AccessorOwnerSchema } from '../../schemas/accessors'
import { isDefined } from '../isDefined'

export abstract class BaseStrictAccessor {
  constructor(private readonly owner: AccessorOwnerSchema) {}

  protected requireResult<T>(result: T | undefined, missingType: string): T {
    if (!isDefined(result)) {
      const name = isDefined(this.owner.name) ? ` (${this.owner.name})` : ''
      throw new Error(`Missing ${missingType} from ${this.owner.type} ${this.owner.id}${name}.`)
    }
    return result
  }
}
