import {
  HasAutoCornerRadiusSchema,
  HasComponentTargetSchema,
  HasCornerRadiusSchema,
  HasIdentitySchema,
  HasTargetSchema,
  HasTypeSchema,
} from './common'

export type StitchDirectionSchema = 'start-to-end' | 'end-to-start'
export type StitchSideSchema = 'top' | 'right' | 'bottom' | 'left'
export type StitchCornerSchema = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

export type StitchLineCommonConfigSchema = {
  stitchMargin: number
  stitchHoleLength: number
  stitchHoleDistance: number
  stitchHoleThickness: number
  stitchLineThickness: number
}

// Are we stitching the given side?
export type HasStitchedSidesSchema = {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

// Are we stitching the given corner (which may or may not have a radius)?
export type HasStitchedCornersSchema = {
  topLeftCorner: boolean
  topRightCorner: boolean
  bottomRightCorner: boolean
  bottomLeftCorner: boolean
}

export type HasCustomRenderTarget = {
  onTop?: string
}

export type HasStitchDirectionSchema = {
  stitchDirection: StitchDirectionSchema
}

export type ComponentBoundsStitchLineOwnSchema = HasBasicOffsetsSchema &
  HasAutoCornerRadiusSchema &
  HasCornerRadiusSchema &
  HasStitchedCornersSchema &
  HasStitchedSidesSchema &
  HasCustomRenderTarget &
  HasStitchDirectionSchema

export type ComponentBoundsStitchLineSchema = HasTypeSchema<'component-bounds-stitch-line'> &
  HasIdentitySchema &
  HasTargetSchema &
  Partial<StitchLineCommonConfigSchema> &
  ComponentBoundsStitchLineOwnSchema

export type HasBasicOffsetsSchema = {
  startOffset: number
  endOffset: number
}

export type TPocketStitchLineOwnSchema = HasBasicOffsetsSchema & HasStitchDirectionSchema

export type TPocketStitchLineSchema = HasTypeSchema<'t-pocket-stitch-line'> &
  HasIdentitySchema &
  HasComponentTargetSchema &
  Partial<StitchLineCommonConfigSchema> &
  TPocketStitchLineOwnSchema

export type StitchLineSchema = ComponentBoundsStitchLineSchema | TPocketStitchLineSchema

export type ResolvedComponentBoundsStitchLineSchema = HasTypeSchema<'component-bounds-stitch-line'> &
  HasIdentitySchema &
  HasTargetSchema &
  StitchLineCommonConfigSchema &
  ComponentBoundsStitchLineOwnSchema

export type ResolvedTPocketStitchLineSchema = HasTypeSchema<'t-pocket-stitch-line'> &
  HasIdentitySchema &
  HasComponentTargetSchema &
  StitchLineCommonConfigSchema &
  TPocketStitchLineOwnSchema

export type ResolvedStitchLineSchema = ResolvedComponentBoundsStitchLineSchema | ResolvedTPocketStitchLineSchema
