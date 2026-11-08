import { IdPrefixSchema, NameGeneratorSchema } from '../../schemas/idGenerator'
import { isDefined } from '../isDefined'

const emptySet: ReadonlySet<string> = new Set()

export class NameGenerator implements NameGeneratorSchema {
  private static readonly trailingNumberPattern = /^(.+) (\d+)$/
  private readonly translated: ReadonlySet<string>

  constructor(private readonly translation: Record<IdPrefixSchema, string>) {
    this.translation = translation
    this.translated = new Set(Object.values(translation))
  }

  public get(type: IdPrefixSchema, forbidden: ReadonlySet<string> = emptySet): string {
    const baseName = this.translation[type]
    const usedIndices = this.getUsedIndices(forbidden)
    const number = (usedIndices[usedIndices.length - 1] ?? 0) + 1
    return this.getNumberedName(baseName, number)
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

  private getUsedIndices(forbidden: ReadonlySet<string> = emptySet): number[] {
    const numbers: number[] = []
    for (const name of forbidden) {
      const sourceNameMatch = name.match(NameGenerator.trailingNumberPattern)
      if (sourceNameMatch === null || !isDefined(sourceNameMatch[1]) || !isDefined(sourceNameMatch[2])) {
        continue
      }
      const baseName = sourceNameMatch[1]
      // Only consider default names, if the user changes it's index manually, it's not our problem.
      if (!this.translated.has(baseName)) {
        continue
      }
      const n = Number(sourceNameMatch[2])
      // If it ends with a valid number collect it.
      if (!Number.isNaN(n)) {
        numbers.push(n)
      }
    }
    return numbers.sort((a, b) => a - b)
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
