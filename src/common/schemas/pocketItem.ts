import { HasTypeSchema } from './common'
import { CurrencyIdSchema } from './currency'

export type CardSchemaId = 'ID-1' | 'ID-2' | 'ID-3'

/** Orientation on screen: landscape is wider, portrait is taller. */
export type PocketItemOrientationSchema = 'landscape' | 'portrait'

export type BasePocketItemSchema<Id extends string> = {
  id: Id
  width: number
  height: number
}

export type CardPocketItemSchema = HasTypeSchema<'card'> &
  BasePocketItemSchema<CardSchemaId> & {
    thickness: number
    radius: number
  }

export type BankNotePocketItemSchema = HasTypeSchema<'banknote'> & BasePocketItemSchema<CurrencyIdSchema>

export type PocketItemSchema = CardPocketItemSchema | BankNotePocketItemSchema
