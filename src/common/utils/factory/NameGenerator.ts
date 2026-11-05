import { IdPrefixSchema, NameGeneratorSchema } from '../../schemas/idGenerator'

const emptySet: ReadonlySet<string> = new Set()

export class NameGenerator implements NameGeneratorSchema {
  private static readonly trailingNumberPattern = /^(.+) (\d+)$/

  constructor(private readonly translation: Record<IdPrefixSchema, string>) {
    this.translation = translation
  }

  public get(type: IdPrefixSchema, forbidden: ReadonlySet<string> = emptySet): string {
    const baseName = this.translation[type]
    return this.getByBaseName(baseName, forbidden)
  }

  public getByBaseName(source: string, forbidden: ReadonlySet<string> = emptySet): string {
    const normalizedSourceName = source.trim()
    const sourceNameMatch = normalizedSourceName.match(NameGenerator.trailingNumberPattern)
    const baseName = sourceNameMatch?.[1].trim() ?? normalizedSourceName
    let number = sourceNameMatch === null ? 1 : Number(sourceNameMatch[2]) + 1
    let componentName = this.getNumberedName(baseName, number)

    while (forbidden.has(componentName)) {
      number += 1
      componentName = this.getNumberedName(baseName, number)
    }

    return componentName
  }

  public getAndForbid(type: IdPrefixSchema, forbidden: Set<string>): string {
    const name = this.get(type, forbidden)
    forbidden.add(name)
    return name
  }

  public getByBaseNameAndForbid(baseName: string, forbidden: Set<string>): string {
    const name = this.getByBaseName(baseName, forbidden)
    forbidden.add(name)
    return name
  }

  private getNumberedName(baseName: string, n: number) {
    return baseName === '' ? `${n}` : `${baseName} ${n}`
  }
}
