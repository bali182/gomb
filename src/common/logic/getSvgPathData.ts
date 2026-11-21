import type BigNumber from 'bignumber.js'
import type { LineSchema, PathCommand, PathSchema, PointSchema } from '../schemas/geometry'
import { isDefined } from '../utils/isDefined'

const getSvgPointData = (point: PointSchema, reflectionAxisX?: BigNumber): string => {
  const x = reflectionAxisX?.times(2).minus(point.x) ?? point.x
  return `${x.toString()} ${point.y.toString()}`
}

export const getSvgLinePathData = (line: LineSchema, reflectionAxisX?: BigNumber): string =>
  `M ${getSvgPointData(line.start, reflectionAxisX)} L ${getSvgPointData(line.end, reflectionAxisX)}`

const getSvgPathCommandData = (command: PathCommand, reflectionAxisX?: BigNumber): string => {
  switch (command.type) {
    case 'moveTo':
      return `M ${getSvgPointData(command.point, reflectionAxisX)}`
    case 'lineTo':
      return `L ${getSvgPointData(command.point, reflectionAxisX)}`
    case 'arcTo': {
      const reversed = isDefined(reflectionAxisX) ? !command.reversed : command.reversed
      return `A ${command.radius.toString()} ${command.radius.toString()} 0 0 ${reversed ? '0' : '1'} ${getSvgPointData(command.point, reflectionAxisX)}`
    }
    case 'close':
      return 'Z'
  }
}

export const getSvgPathData = (path: PathSchema, reflectionAxisX?: BigNumber): string =>
  path.commands.map((command) => getSvgPathCommandData(command, reflectionAxisX)).join(' ')
