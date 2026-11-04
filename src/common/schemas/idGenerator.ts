export type IdTypeSchema =
  | 'project'
  | 'sub-project'
  | 'component'
  | 'hole'
  | 'stitch-line'
  | 'pocket-opening'
  | 'constraint'
  | 'constraint-field'

export type UnsafeIdGeneratorSchema = {
  get(type: IdTypeSchema): string
}

export type IdGeneratorSchema = {
  get(type: IdTypeSchema): string
  getAndForbid(type: IdTypeSchema): string
  forbidOne(id: string): void
  forbidAll(ids: string[] | Set<string>): void
}
