import type BigNumber from 'bignumber.js'
import { HasTypeSchema } from './common'

export type PointSchema = {
  x: BigNumber
  y: BigNumber
}

export type LineSchema = {
  start: PointSchema
  end: PointSchema
}

export type NumberPointSchema = {
  x: number
  y: number
}

export type NumberLineSchema = {
  start: NumberPointSchema
  end: NumberPointSchema
}

export type RectSchema = {
  x: BigNumber
  y: BigNumber
  width: BigNumber
  height: BigNumber
}

export type SizeSchema = {
  width: BigNumber
  height: BigNumber
}

export type FillableSizeSchema = {
  width: number | 'fill'
  height: number | 'fill'
}

export type CornerRadiusSchema = {
  readonly topLeft: BigNumber
  readonly topRight: BigNumber
  readonly bottomLeft: BigNumber
  readonly bottomRight: BigNumber
}

export type PathMoveToSchema = HasTypeSchema<'moveTo'> & { point: PointSchema }
export type PathLineToSchema = HasTypeSchema<'lineTo'> & { point: PointSchema }
export type PathArcToSchema = HasTypeSchema<'arcTo'> & { radius: BigNumber; point: PointSchema; reversed: boolean }
export type PathCloseSchema = HasTypeSchema<'close'>

export type PathCommand = PathMoveToSchema | PathLineToSchema | PathArcToSchema | PathCloseSchema

export type PathSchema = {
  commands: PathCommand[]
}
