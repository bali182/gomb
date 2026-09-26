export type AnchorSchema = 'start' | 'middle' | 'end'

export type HasTypeSchema<T extends string> = {
  type: T
}

export type HasId = {
  id: string
}

export type HasName = {
  name: string
}

export type HasVersionSchema = {
  version: string
}

export type HasIdentitySchema = HasId & HasName

export type HasCornerRadiusValuesSchema = {
  topLeftRadius: number
  topRightRadius: number
  bottomLeftRadius: number
  bottomRightRadius: number
}

export type HasCornerRadiusSchema = HasCornerRadiusValuesSchema & {
  individualRadii: boolean
}

export type HasAutoCornerRadiusSchema = {
  autoCornerRadius: boolean
}

export type HasSizeSchema = {
  width: number
  height: number
}

export type HasComponentReferenceSchema = {
  componentId: string
}

export type HasStitchLineReferenceSchema = {
  stitchLineId: string
}

export type HasComponentTargetSchema = {
  targetType: 'component'
  targetId: string
}

export type HasHoleTargetSchema = {
  targetType: 'hole'
  targetId: string
}

export type HasTargetSchema = HasComponentTargetSchema | HasHoleTargetSchema

export type HasXYOffsetSchema = {
  xOffset: number
  yOffset: number
}

export type HasSqueezeValuesSchema = {
  topSqueeze: number
  rightSqueeze: number
  bottomSqueeze: number
  leftSqueeze: number
}

export type HasSqueezeSchema = HasSqueezeValuesSchema & {
  individualSqueeze: boolean
}

export type HasOffAxisAnchor = {
  offAxisAnchor: AnchorSchema
}
