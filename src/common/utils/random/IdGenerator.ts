import { customAlphabet } from 'nanoid'
import { IdGeneratorSchema, IdPrefixSchema } from '../../schemas/idGenerator'

const emptySet: ReadonlySet<string> = new Set()

export class IdGenerator implements IdGeneratorSchema {
  private static readonly alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  private static readonly generator = customAlphabet(IdGenerator.alphabet, 10)

  public get(prefix: IdPrefixSchema, forbidden: ReadonlySet<string> = emptySet): string {
    let newId = `${prefix}-${IdGenerator.generator()}`
    while (forbidden.has(newId)) {
      newId = `${prefix}-${IdGenerator.generator()}`
    }
    return newId
  }

  public getAndForbid(prefix: IdPrefixSchema, forbidden: Set<string>): string {
    const newId = this.get(prefix, forbidden)
    forbidden.add(newId)
    return newId
  }
}
