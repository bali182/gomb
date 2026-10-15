import type { PocketOpeningOwnSchema, PocketOrientationSchema } from '../schemas/components'
import type { CornerRadiusSchema, PathSchema, RectSchema } from '../schemas/geometry'
import { calculatePocketOpeningPath } from './calculatePocketOpeningPath'
import { calculateRectPath } from './calculateRectPath'

export const calculateFrontPocketPath = (
  rect: RectSchema,
  cornerRadius: CornerRadiusSchema,
  orientation: PocketOrientationSchema,
  adjustedOpening: PocketOpeningOwnSchema,
): PathSchema => {
  const path = calculateRectPath(rect, cornerRadius)
  if (adjustedOpening.type === 'straight') {
    return path
  }

  const opening = calculatePocketOpeningPath(adjustedOpening, rect, orientation).commands.filter(
    (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
  )
  const endpoint = {
    x: orientation === 'up' || orientation === 'right' ? rect.x.plus(rect.width) : rect.x,
    y: orientation === 'down' || orientation === 'right' ? rect.y.plus(rect.height) : rect.y,
  }

  return {
    commands: path.commands.flatMap((command) => {
      if (command.type === 'lineTo' && command.point.x.isEqualTo(endpoint.x) && command.point.y.isEqualTo(endpoint.y)) {
        return [...opening, command]
      }
      return [command]
    }),
  }
}
