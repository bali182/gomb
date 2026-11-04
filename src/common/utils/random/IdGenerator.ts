import { customAlphabet } from 'nanoid'
import { IdGeneratorSchema, IdTypeSchema, UnsafeIdGeneratorSchema } from '../../schemas/idGenerator'

export class IdGenerator implements IdGeneratorSchema {
  private readonly forbidden: Set<string>

  private static readonly alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  private static readonly generator = customAlphabet(IdGenerator.alphabet, 10)

  constructor(forbidden?: string[] | Set<string>) {
    this.forbidden = new Set(forbidden ?? [])
  }

  public get(type: IdTypeSchema): string {
    let newId = `${type}-${IdGenerator.generator()}`
    while (this.forbidden.has(newId)) {
      newId = `${type}-${IdGenerator.generator()}`
    }
    return newId
  }

  public getAndForbid(type: IdTypeSchema): string {
    const newId = this.get(type)
    this.forbidOne(newId)
    return newId
  }

  public forbidOne(id: string): void {
    this.forbidden.add(id)
  }

  public forbidAll(ids: string[] | Set<string>): void {
    for (const id of ids) {
      this.forbidOne(id)
    }
  }

  public static unsafe: UnsafeIdGeneratorSchema = new IdGenerator([])
}
