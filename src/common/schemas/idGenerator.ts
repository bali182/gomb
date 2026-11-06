export type IdPrefixSchema =
  | 'project'
  | 'sub-project'
  | 'root-panel'
  | 'panel'
  | 'pocket-cluster'
  | 'front-pocket'
  | 't-pocket'
  | 't-pocket-stitch-line'
  | 'component-bounds-stitch-line'
  | 'hole'
  | 'straight-pocket-opening'
  | 'recessed-pocket-opening'
  | 'slanted-pocket-opening'
  | 'optical-illusion-pocket-opening'
  | 'equal-constraint'
  | 'root-panel-constraint-field'
  | 'panel-constraint-field'
  | 'pocket-cluster-constraint-field'
  | 'front-pocket-constraint-field'
  | 't-pocket-constraint-field'
  | 'hole-constraint-field'
  | 'recessed-constraint-field'
  | 'slanted-constraint-field'
  | 'optical-illusion-constraint-field'
  | 'component-bounds-stitch-line-constraint-field'
  | 't-pocket-stitch-line-constraint-field'

export type IdGeneratorSchema = {
  get(prefix: IdPrefixSchema, forbidden?: ReadonlySet<string>): string
  getAndForbid(prefix: IdPrefixSchema, forbidden: Set<string>): string
}

export type NameGeneratorSchema = {
  get(prefix: IdPrefixSchema, forbidden?: ReadonlySet<string>): string
  getByBaseName(baseName: string, forbidden?: ReadonlySet<string>): string
  getAndForbid(prefix: IdPrefixSchema, forbidden: Set<string>): string
  getByBaseNameAndForbid(baseName: string, forbidden: Set<string>): string
}
