export type PageSchemaId = 'A5' | 'A4' | 'A3' | 'JIS-B5' | 'JIS-B4' | 'Letter' | 'Legal' | 'Tabloid' | 'Executive'

// Represents a page in portrait orientation.
export type PageSchema = {
  id: PageSchemaId
  width: number
  height: number
}
