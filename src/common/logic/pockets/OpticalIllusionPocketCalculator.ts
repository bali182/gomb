import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import { POSITION_EPSILON, ZERO } from '../../constants/layout'
import type { OpticalIllusionPocketOpeningSchema } from '../../schemas/components'
import type { PathCommand, PathSchema, PointSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { getPathSegmentIntersections } from '../pathSegmentIntersections'
import { createPathFromConnectedSegments, getPathSegments } from '../pathSegments'
import type { LinePathSegment, PathSegment } from '../pathSegmentTypes'
import { splitPathSegment } from '../pathSegmentUtils'
import { PocketCalculator } from './PocketCalculator'

export class OpticalIllusionPocketCalculator extends PocketCalculator<OpticalIllusionPocketOpeningSchema> {
  getPocketOpeningPath(): PathSchema {
    const height = BigNumber.minimum(this.pocketCluster.pocketStep, this.depth)
    if (height.isZero() || this.width.isZero()) {
      return {
        commands: [
          { type: 'moveTo', point: { x: ZERO, y: ZERO } },
          { type: 'lineTo', point: { x: this.width, y: ZERO } },
        ],
      }
    }

    const count = this.pocketCluster.children.length
    const index = this.pocketCluster.children.indexOf(this.pocket.id)
    if (count === 0 || index < 0) {
      throw new Error('Optical illusion pocket must belong to its cluster')
    }
    const run = this.width.minus(this.opening.startInset).minus(this.opening.endInset).dividedBy(count)
    const leadingX = new BigNumber(this.opening.startInset).plus(run.times(count - 1 - index))
    const trailingX = leadingX.plus(run)
    const length = run.pow(2).plus(height.pow(2)).sqrt()
    const factor = height.dividedBy(length.plus(run))
    const leadingRadius = new BigNumber(this.opening.leadingRadius)
    const trailingRadius = new BigNumber(this.opening.trailingRadius)
    const leadingTrim = leadingRadius.times(factor)
    const trailingTrim = trailingRadius.times(factor)
    const unitX = run.dividedBy(length)
    const unitY = height.dividedBy(length)
    const commands: PathCommand[] = [{ type: 'moveTo', point: { x: ZERO, y: height } }]
    this.appendLine(commands, { x: leadingX.minus(leadingTrim), y: height })
    if (leadingRadius.gt(0)) {
      commands.push({
        type: 'arcTo',
        radius: leadingRadius,
        reversed: true,
        point: {
          x: leadingX.plus(unitX.times(leadingTrim)),
          y: height.minus(unitY.times(leadingTrim)),
        },
      })
    }
    this.appendLine(commands, {
      x: trailingX.minus(unitX.times(trailingTrim)),
      y: unitY.times(trailingTrim),
    })
    if (trailingRadius.gt(0)) {
      commands.push({
        type: 'arcTo',
        radius: trailingRadius,
        reversed: false,
        point: { x: trailingX.plus(trailingTrim), y: ZERO },
      })
    }
    this.appendLine(commands, { x: this.width, y: ZERO })
    const path = { commands }
    return this.opening.direction === 'start' ? path : this.reflectOpening(path)
  }

  getTPocketPath(): PathSchema {
    if (!narrowers.is.tPocket(this.pocket)) {
      throw new Error('T-pocket path requires a T-pocket')
    }
    const opening = this.getPocketOpeningPath()
    const height = BigNumber.minimum(this.pocketCluster.pocketStep, this.depth)
    const tabDepth = BigNumber.minimum(this.pocketCluster.pocketStep, BigNumber.maximum(this.depth.minus(height), 0))
    const tabWidth = new BigNumber(this.pocket.tPocketTabWidth)
    const left = this.getShoulderCommands(opening, ZERO, tabWidth, tabDepth)
    const right = this.getShoulderCommands(opening, this.width.minus(tabWidth), this.width, tabDepth)
    return this.transformPath({
      commands: [...opening.commands, ...right, ...this.getTPocketBottomCommands(), ...left, { type: 'close' }],
    })
  }

  private appendLine(commands: PathCommand[], point: PointSchema): void {
    const previous = commands[commands.length - 1]
    if (
      isDefined(previous) &&
      !narrowers.path.is.close(previous) &&
      previous.point.x.minus(point.x).abs().lte(POSITION_EPSILON) &&
      previous.point.y.minus(point.y).abs().lte(POSITION_EPSILON)
    ) {
      return
    }
    commands.push({ type: 'lineTo', point })
  }

  private reflectOpening(path: PathSchema): PathSchema {
    const reflected = getPathSegments(path)
      .reverse()
      .map(
        (segment): PathSegment => ({
          ...segment,
          start: { x: this.width.minus(segment.end.x), y: segment.end.y },
          end: { x: this.width.minus(segment.start.x), y: segment.start.y },
        }),
      )
    return createPathFromConnectedSegments(reflected)
  }

  /** Follow the rounded opening backwards, translated inward, over one tab's width. */
  private getShoulderCommands(path: PathSchema, start: BigNumber, end: BigNumber, offset: BigNumber): PathCommand[] {
    const boundaries: LinePathSegment[] = [start, end].map((x) => ({
      type: 'line',
      start: { x, y: new BigNumber(-1) },
      end: { x, y: this.depth.plus(1) },
    }))
    const pieces = getPathSegments(path).flatMap((segment) => {
      const progresses = boundaries.flatMap((boundary) =>
        getPathSegmentIntersections(segment, boundary).map((intersection) => intersection.firstProgress),
      )
      return splitPathSegment(segment, progresses).filter((piece) => {
        const middleX = piece.start.x.plus(piece.end.x).dividedBy(2)
        return middleX.gte(start) && middleX.lte(end)
      })
    })
    const reversed: PathSegment[] = pieces.reverse().map((segment): PathSegment => {
      const startPoint = { x: segment.end.x, y: segment.end.y.plus(offset) }
      const endPoint = { x: segment.start.x, y: segment.start.y.plus(offset) }
      return narrowers.path.is.lineSegment(segment)
        ? { type: 'line', start: startPoint, end: endPoint }
        : { ...segment, start: startPoint, end: endPoint, reversed: !segment.reversed }
    })
    if (reversed.length === 0) {
      return []
    }
    return createPathFromConnectedSegments(reversed).commands.map(
      (command): PathCommand =>
        narrowers.path.is.moveTo(command) ? { type: 'lineTo', point: command.point } : command,
    )
  }
}
