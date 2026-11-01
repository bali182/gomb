import {
  AnchorSchema,
  HasCornerRadiusSchema,
  HasIdentitySchema,
  HasOffAxisAnchor,
  HasSizeSchema,
  HasStretchSchema,
  HasTypeSchema,
} from './common'
import { PocketItemIdSchema, PocketItemOrientationSchema } from './pocketItem'

export type HasColorSchema = {
  color?: string
}

export type BaseComponentSchema = HasIdentitySchema & HasColorSchema

export type HasChildrenSchema = {
  children: string[]
}

export type HasLayoutSchema = {
  layoutOrientation: LayoutOrientationSchema
  mainAxisAnchor: AnchorSchema
  layoutGap: number
  autoLayoutGap: boolean
}

export type HasAutoDimensionsSchema = HasSizeSchema & {
  autoWidth: boolean
  autoHeight: boolean
}

export type LayoutOrientationSchema = 'horizontal' | 'vertical'

/** A plain panel. Can have children (stuff placed on top of it) */
export type RootPanelSchema = HasTypeSchema<'root-panel'> &
  BaseComponentSchema &
  HasLayoutSchema &
  HasChildrenSchema &
  HasCornerRadiusSchema &
  HasSizeSchema

/** A plain panel. Can have children (stuff placed on top of it) */
export type PanelSchema = HasTypeSchema<'panel'> &
  BaseComponentSchema &
  HasLayoutSchema &
  HasOffAxisAnchor &
  HasChildrenSchema &
  HasCornerRadiusSchema &
  HasAutoDimensionsSchema &
  HasStretchSchema

export type PocketOrientationSchema = 'up' | 'down' | 'left' | 'right'

export type HasPocketOpeningSchema = {
  openingId: string
}

export type FrontPocketSchema = HasTypeSchema<'front-pocket'> &
  BaseComponentSchema &
  HasChildrenSchema &
  HasLayoutSchema &
  HasCornerRadiusSchema &
  HasPocketOpeningSchema &
  HasPocketItemSchema

export type TPocketSchema = HasTypeSchema<'t-pocket'> &
  BaseComponentSchema &
  HasChildrenSchema &
  HasPocketItemSchema &
  HasPocketOpeningSchema & {
    tPocketTabWidth: number
    tPocketTaper: number
  }

export type PocketSchema = FrontPocketSchema | TPocketSchema

export type PocketsSchema = {
  /** Offset between adjacent pocket bounding boxes along the stack axis. */
  pocketStep: number
  orientation: PocketOrientationSchema
}

export type HasPocketItemSchema = {
  /** Optional card or banknote shown in this pocket. */
  itemId?: PocketItemIdSchema
  /** Orientation on screen, independent of the pocket opening direction. */
  itemOrientation: PocketItemOrientationSchema
  /** Signed offset from the pocket center across the opening direction, in mm. */
  itemCrossAxisOffset: number
  /** Offset from the closed pocket edge toward the opening, in mm (min 0). */
  itemOpeningOffset: number
}

/** Arranges physical pocket components. Its children are T-pockets followed by one front pocket. */
export type PocketClusterSchema = HasTypeSchema<'pocket-cluster'> &
  BaseComponentSchema &
  HasChildrenSchema &
  HasOffAxisAnchor &
  HasCornerRadiusSchema &
  HasAutoDimensionsSchema &
  HasStretchSchema &
  PocketsSchema

export type ComponentSchema = RootPanelSchema | PanelSchema | PocketClusterSchema | FrontPocketSchema | TPocketSchema
