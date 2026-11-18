export type IdPrefixSchema =
  | 'project'
  | 'sub-project'
  | 'root-panel-face'
  | 'root-panel-face-binding-field'
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
  | 'equal-binding'
  | 'root-panel-binding-field'
  | 'panel-binding-field'
  | 'pocket-cluster-binding-field'
  | 'front-pocket-binding-field'
  | 't-pocket-binding-field'
  | 'hole-binding-field'
  | 'recessed-binding-field'
  | 'slanted-binding-field'
  | 'optical-illusion-binding-field'
  | 'component-bounds-stitch-line-binding-field'
  | 't-pocket-stitch-line-binding-field'

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
