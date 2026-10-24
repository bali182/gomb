export type CardSchemaId = 'ID-1' | 'ID-2' | 'ID-3'

/** Orientation on screen: landscape is wider, portrait is taller. */
export type PocketItemOrientationSchema = 'landscape' | 'portrait'

export type CardSchema = {
  id: CardSchemaId
  width: number
  height: number
  thickness: number
  radius: number
}

export type BankNoteSchema = {
  id: string
  width: number
  height: number
}
