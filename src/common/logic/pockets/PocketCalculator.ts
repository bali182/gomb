import BigNumber from 'bignumber.js'

import { ZERO } from '../../constants/layout'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { CornerRadiusSchema, PathCommand, PathSchema, PointSchema, RectSchema } from '../../schemas/geometry'

/** One pocket's immutable calculation inputs. Opening paths are local previews, complete paths are positioned. */
export abstract class PocketCalculator<T extends PocketOpeningSchema> {
  protected readonly width: BigNumber
  protected readonly depth: BigNumber

  constructor(
    protected readonly pocketCluster: PocketClusterSchema,
    protected readonly opening: T,
    protected readonly pocketRect: RectSchema,
    protected readonly cornerRadius: CornerRadiusSchema,
  ) {
    const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
    this.width = isVertical ? pocketRect.width : pocketRect.height
    this.depth = isVertical ? pocketRect.height : pocketRect.width
  }

  /** The opening alone, facing up at the origin, for previews and local contour assembly. */
  abstract getPocketOpeningPath(): PathSchema

  abstract getTPocketPath(): PathSchema

  getFrontPocketPath(): PathSchema {
    const radius = this.getLocalCornerRadius()
    const commands: PathCommand[] = [
      ...this.getPocketOpeningPath().commands,
      { type: 'lineTo', point: { x: this.width, y: this.depth.minus(radius.bottomRight) } },
    ]
    if (radius.bottomRight.gt(0)) {
      commands.push({
        type: 'arcTo',
        radius: radius.bottomRight,
        point: { x: this.width.minus(radius.bottomRight), y: this.depth },
        reversed: false,
      })
    }
    commands.push({ type: 'lineTo', point: { x: radius.bottomLeft, y: this.depth } })
    if (radius.bottomLeft.gt(0)) {
      commands.push({
        type: 'arcTo',
        radius: radius.bottomLeft,
        point: { x: ZERO, y: this.depth.minus(radius.bottomLeft) },
        reversed: false,
      })
    }
    commands.push({ type: 'close' })
    return this.transformPath({ commands })
  }

  protected getTPocketBottomCommands(): PathCommand[] {
    const taper = new BigNumber(this.pocketCluster.tPocketTaper)
    return [
      { type: 'lineTo', point: { x: this.width.minus(taper), y: this.depth } },
      { type: 'lineTo', point: { x: taper, y: this.depth } },
    ]
  }

  protected transformPath(path: PathSchema): PathSchema {
    return {
      commands: path.commands.map(
        (command: PathCommand): PathCommand =>
          command.type === 'close' ? command : { ...command, point: this.transformPoint(command.point) },
      ),
    }
  }

  private transformPoint(point: PointSchema): PointSchema {
    const rect = this.pocketRect
    switch (this.pocketCluster.orientation) {
      case 'up':
        return { x: rect.x.plus(point.x), y: rect.y.plus(point.y) }
      case 'right':
        return { x: rect.x.plus(rect.width).minus(point.y), y: rect.y.plus(point.x) }
      case 'down':
        return { x: rect.x.plus(rect.width).minus(point.x), y: rect.y.plus(rect.height).minus(point.y) }
      case 'left':
        return { x: rect.x.plus(point.y), y: rect.y.plus(rect.height).minus(point.x) }
    }
  }

  private getLocalCornerRadius(): CornerRadiusSchema {
    const radius = this.cornerRadius
    switch (this.pocketCluster.orientation) {
      case 'up':
        return { topLeft: ZERO, topRight: ZERO, bottomLeft: radius.bottomLeft, bottomRight: radius.bottomRight }
      case 'right':
        return { topLeft: ZERO, topRight: ZERO, bottomLeft: radius.topLeft, bottomRight: radius.bottomLeft }
      case 'down':
        return { topLeft: ZERO, topRight: ZERO, bottomLeft: radius.topRight, bottomRight: radius.topLeft }
      case 'left':
        return { topLeft: ZERO, topRight: ZERO, bottomLeft: radius.bottomRight, bottomRight: radius.topRight }
    }
  }
}
