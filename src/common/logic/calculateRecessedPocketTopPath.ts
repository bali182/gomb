import BigNumber from 'bignumber.js'

import type { PocketOrientationSchema, RecessedPocketOpeningSchema } from '../schemas/components'
import type { PathCommand, PathSchema, PointSchema, RectSchema } from '../schemas/geometry'

type RecessedPocketTopVertex = {
  point: PointSchema
  radius: BigNumber
}

export const calculateRecessedPocketTopPath = (
  adjustedPocketTop: RecessedPocketOpeningSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema => {
  const isVertical = orientation === 'up' || orientation === 'down'
  const width = isVertical ? pocketRect.width : pocketRect.height
  const vertices = createRecessedVertices(adjustedPocketTop, width)
  const commands = calculateRecessedCommands(vertices)
  const path = { commands: removeZeroLengthLines(commands) }

  return transformPocketTopPath(path, pocketRect, orientation)
}

const createRecessedVertices = (pocketTop: RecessedPocketOpeningSchema, width: BigNumber): RecessedPocketTopVertex[] => {
  const zero = new BigNumber(0)
  const vertices: RecessedPocketTopVertex[] = [{ point: { x: zero, y: zero }, radius: zero }]

  if (pocketTop.depth > 0 && pocketTop.outerInset < width.dividedBy(2).toNumber()) {
    const outer = new BigNumber(pocketTop.outerInset)
    const inner = new BigNumber(pocketTop.innerInset)
    const depth = new BigNumber(pocketTop.depth)
    const outerRadius = new BigNumber(pocketTop.outerRadius)
    const innerRadius = new BigNumber(pocketTop.innerRadius)
    vertices.push(
      { point: { x: outer, y: zero }, radius: outerRadius },
      { point: { x: inner, y: depth }, radius: innerRadius },
      { point: { x: width.minus(inner), y: depth }, radius: innerRadius },
      { point: { x: width.minus(outer), y: zero }, radius: outerRadius },
    )
  }

  vertices.push({ point: { x: width, y: zero }, radius: zero })
  return vertices.filter(
    ({ point }, index) =>
      index === 0 || !point.x.isEqualTo(vertices[index - 1].point.x) || !point.y.isEqualTo(vertices[index - 1].point.y),
  )
}

const calculateRecessedCommands = (vertices: RecessedPocketTopVertex[]): PathCommand[] => {
  const commands: PathCommand[] = [{ type: 'moveTo', point: vertices[0].point }]

  for (let index = 1; index < vertices.length - 1; index += 1) {
    commands.push(...calculateCornerCommands(vertices[index - 1].point, vertices[index], vertices[index + 1].point))
  }

  commands.push({ type: 'lineTo', point: vertices[vertices.length - 1].point })
  return commands
}

const calculateCornerCommands = (
  previous: PointSchema,
  vertex: RecessedPocketTopVertex,
  next: PointSchema,
): PathCommand[] => {
  const { point, radius } = vertex
  const incomingX = point.x.minus(previous.x)
  const incomingY = point.y.minus(previous.y)
  const outgoingX = next.x.minus(point.x)
  const outgoingY = next.y.minus(point.y)
  const incomingLength = incomingX.pow(2).plus(incomingY.pow(2)).sqrt()
  const outgoingLength = outgoingX.pow(2).plus(outgoingY.pow(2)).sqrt()
  const turn = incomingX.times(outgoingY).minus(incomingY.times(outgoingX))

  if (radius.isZero() || turn.isZero()) {
    return [{ type: 'lineTo', point }]
  }

  const cosine = incomingX
    .times(outgoingX)
    .plus(incomingY.times(outgoingY))
    .dividedBy(incomingLength.times(outgoingLength))
  const factor = new BigNumber(1).minus(cosine).dividedBy(new BigNumber(1).plus(cosine)).sqrt()
  const length = radius.times(factor)
  const start = {
    x: point.x.minus(incomingX.dividedBy(incomingLength).times(length)),
    y: point.y.minus(incomingY.dividedBy(incomingLength).times(length)),
  }
  const end = {
    x: point.x.plus(outgoingX.dividedBy(outgoingLength).times(length)),
    y: point.y.plus(outgoingY.dividedBy(outgoingLength).times(length)),
  }

  return [
    { type: 'lineTo', point: start },
    { type: 'arcTo', point: end, radius, reversed: turn.isNegative() },
  ]
}

const removeZeroLengthLines = (commands: PathCommand[]): PathCommand[] => {
  const result: PathCommand[] = []
  let currentPoint: PointSchema | undefined

  for (const command of commands) {
    if (command.type === 'close') {
      result.push(command)
      continue
    }
    if (
      command.type === 'lineTo' &&
      currentPoint?.x.isEqualTo(command.point.x) === true &&
      currentPoint?.y.isEqualTo(command.point.y) === true
    ) {
      continue
    }
    result.push(command)
    currentPoint = command.point
  }

  return result
}

const transformPocketTopPath = (
  path: PathSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema => ({
  commands: path.commands.map(
    (command: PathCommand): PathCommand =>
      command.type === 'close'
        ? command
        : { ...command, point: transformPocketTopPoint(command.point, pocketRect, orientation) },
  ),
})

const transformPocketTopPoint = (
  point: PointSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PointSchema => {
  switch (orientation) {
    case 'up':
      return { x: pocketRect.x.plus(point.x), y: pocketRect.y.plus(point.y) }
    case 'right':
      return { x: pocketRect.x.plus(pocketRect.width).minus(point.y), y: pocketRect.y.plus(point.x) }
    case 'down':
      return {
        x: pocketRect.x.plus(pocketRect.width).minus(point.x),
        y: pocketRect.y.plus(pocketRect.height).minus(point.y),
      }
    case 'left':
      return { x: pocketRect.x.plus(point.y), y: pocketRect.y.plus(pocketRect.height).minus(point.x) }
  }
}
