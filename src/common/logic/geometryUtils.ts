import type BigNumber from 'bignumber.js'

import type { PathSchema, PointSchema, RectSchema } from '../schemas/geometry'

export const getPointDistance = (first: PointSchema, second: PointSchema): BigNumber => {
  const deltaX = first.x.minus(second.x)
  const deltaY = first.y.minus(second.y)
  return deltaX.times(deltaX).plus(deltaY.times(deltaY)).sqrt()
}

export const reflectPointHorizontally = (point: PointSchema, axisX: BigNumber): PointSchema => ({
  x: axisX.times(2).minus(point.x),
  y: point.y,
})

export const reflectRectHorizontally = (rect: RectSchema, axisX: BigNumber): RectSchema => ({
  ...rect,
  x: axisX.times(2).minus(rect.x.plus(rect.width)),
})

export const reflectPathHorizontally = (path: PathSchema, axisX: BigNumber): PathSchema => ({
  commands: path.commands.map((command) => {
    switch (command.type) {
      case 'moveTo':
      case 'lineTo':
        return { ...command, point: reflectPointHorizontally(command.point, axisX) }
      case 'arcTo':
        return { ...command, point: reflectPointHorizontally(command.point, axisX), reversed: !command.reversed }
      case 'close':
        return command
    }
  }),
})

export const getHorizontalReflectionTransform = (axisX: BigNumber): string =>
  `matrix(-1 0 0 1 ${axisX.times(2).toString()} 0)`
