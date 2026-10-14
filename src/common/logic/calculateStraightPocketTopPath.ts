import type { PocketOrientationSchema, StraightPocketTopSchema } from '../schemas/components'
import type { PathCommand, PathSchema, PointSchema, RectSchema } from '../schemas/geometry'

export const calculateStraightPocketTopPath = (
  _pocketTop: StraightPocketTopSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema => {
  const start = getOpeningStart(pocketRect, orientation)
  const end = getOpeningEnd(pocketRect, orientation)
  const commands: PathCommand[] = [{ type: 'moveTo', point: start }]

  if (!start.x.isEqualTo(end.x) || !start.y.isEqualTo(end.y)) {
    commands.push({ type: 'lineTo', point: end })
  }

  return { commands }
}

const getOpeningStart = (rect: RectSchema, orientation: PocketOrientationSchema): PointSchema => {
  switch (orientation) {
    case 'up':
      return { x: rect.x, y: rect.y }
    case 'right':
      return { x: rect.x.plus(rect.width), y: rect.y }
    case 'down':
      return { x: rect.x.plus(rect.width), y: rect.y.plus(rect.height) }
    case 'left':
      return { x: rect.x, y: rect.y.plus(rect.height) }
  }
}

const getOpeningEnd = (rect: RectSchema, orientation: PocketOrientationSchema): PointSchema => {
  switch (orientation) {
    case 'up':
      return { x: rect.x.plus(rect.width), y: rect.y }
    case 'right':
      return { x: rect.x.plus(rect.width), y: rect.y.plus(rect.height) }
    case 'down':
      return { x: rect.x, y: rect.y.plus(rect.height) }
    case 'left':
      return { x: rect.x, y: rect.y }
  }
}
