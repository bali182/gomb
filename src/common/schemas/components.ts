import {
  HasCornerRadiusSchema,
  HasIdentitySchema,
  HasOffAxisAnchor,
  HasSizeSchema,
  HasSqueezeSchema,
  HasTypeSchema,
} from './common'
import { CardSchemaId } from './valuables'

export type HasColorSchema = {
  color?: string
}

export type BaseComponentSchema = HasIdentitySchema & HasColorSchema

export type HasChildrenSchema = {
  children: string[]
}

export type HasLayoutSchema = {
  layoutOrientation: LayoutOrientationSchema
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
  HasSqueezeSchema

export type PocketOrientationSchema = 'up' | 'down' | 'left' | 'right'

/**
 * A cluster of pockets.
 * Does not hold individual pockets, rather pocketCount-1 T-Pockets and 1 top pocket (computed internally).
 */
export type PocketClusterSchema = HasTypeSchema<'pocket-cluster'> &
  BaseComponentSchema &
  HasLayoutSchema &
  HasChildrenSchema &
  HasOffAxisAnchor &
  HasCornerRadiusSchema &
  HasAutoDimensionsSchema &
  HasSqueezeSchema & {
    /** How many pockets do we have in this cluster (min 1) */
    pocketCount: number
    /** How far each pocket is offset from the previous one along the stack axis */
    pocketStep: number
    /** Direction where the pocket opening is. Example means you can put the card in from the top, and left means from the left side. */
    orientation: PocketOrientationSchema
    /** Size of the flaps/tabs on the T-Pockets */
    tPocketTabWidth: number
    /** How much the t pockets taper from the 2 * tPocketTabWidth reduced width to the bottom of the pocket */
    tPocketTaper: number
    /** Id of the card shown in every pocket */
    cardId?: CardSchemaId
  }

export type ComponentSchema = RootPanelSchema | PanelSchema | PocketClusterSchema
