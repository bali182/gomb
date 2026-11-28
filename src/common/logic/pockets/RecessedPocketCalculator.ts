import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import type { PathCommand, PathSchema, PointSchema } from '../../schemas/geometry'
import type { RecessedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { StandardTPocketCalculator } from './StandardTPocketCalculator'

export class RecessedPocketCalculator extends StandardTPocketCalculator<RecessedPocketOpeningSchema> {
  getPocketOpeningPath(): PathSchema {
    const zero = new BigNumber(0)
    const commands: PathCommand[] = [
      { type: 'moveTo', point: { x: zero, y: zero } },
      ...this.getOpeningCommands().map((command): PathCommand => {
        if (narrowers.path.is.close(command)) {
          return command
        }
        const point: PointSchema = { x: command.point.x.plus(this.opening.recessStartMargin), y: command.point.y }
        return narrowers.path.is.moveTo(command) ? { type: 'lineTo', point } : { ...command, point }
      }),
      { type: 'lineTo', point: { x: this.width, y: zero } },
    ]
    return { commands: this.removeZeroLengthLines(commands) }
  }

  private getOpeningWidth(): BigNumber {
    return this.width.minus(this.opening.recessStartMargin).minus(this.opening.recessEndMargin)
  }

  private getOpeningCommands(): PathCommand[] {
    const opening = this.opening
    const width = this.getOpeningWidth()
    const zero = new BigNumber(0)
    const halfWidth = width.dividedBy(2)

    if (opening.recessDepth === 0 || halfWidth.isLessThanOrEqualTo(opening.recessOuterInset)) {
      return [
        { type: 'moveTo', point: { x: zero, y: zero } },
        { type: 'lineTo', point: { x: width, y: zero } },
      ]
    }

    const depth = new BigNumber(opening.recessDepth)
    const horizontalDistance = halfWidth.minus(opening.recessInnerOffset).minus(opening.recessOuterInset)
    const sideLength = horizontalDistance.pow(2).plus(depth.pow(2)).sqrt()
    const angleFactor = depth.dividedBy(sideLength.plus(horizontalDistance))
    const requiredLength = new BigNumber(opening.recessOuterRadius).plus(opening.recessInnerRadius).times(angleFactor)
    const leftTransition = requiredLength.isGreaterThanOrEqualTo(sideLength)
      ? this.getTouchingTransitionCommands(angleFactor)
      : this.getSeparatedTransitionCommands(angleFactor)

    return this.getSymmetricOpeningCommands(leftTransition)
  }

  private getSeparatedTransitionCommands(angleFactor: BigNumber): PathCommand[] {
    const opening = this.opening
    const width = this.getOpeningWidth()
    const zero = new BigNumber(0)
    const outerRadius = new BigNumber(opening.recessOuterRadius)
    const innerRadius = new BigNumber(opening.recessInnerRadius)
    const depth = new BigNumber(opening.recessDepth)
    const denominator = angleFactor.pow(2).plus(1)
    const sine = angleFactor.times(2).dividedBy(denominator)
    const oneMinusCosine = angleFactor.pow(2).times(2).dividedBy(denominator)
    const outerStart: PointSchema = {
      x: new BigNumber(opening.recessOuterInset).minus(outerRadius.times(angleFactor)),
      y: zero,
    }
    const innerEnd: PointSchema = {
      x: width.dividedBy(2).minus(opening.recessInnerOffset).plus(innerRadius.times(angleFactor)),
      y: depth,
    }
    const commands: PathCommand[] = [{ type: 'moveTo', point: outerStart }]

    if (outerRadius.isGreaterThan(0)) {
      commands.push({
        type: 'arcTo',
        point: { x: outerStart.x.plus(outerRadius.times(sine)), y: outerRadius.times(oneMinusCosine) },
        radius: outerRadius,
        reversed: false,
      })
    }

    commands.push({
      type: 'lineTo',
      point: { x: innerEnd.x.minus(innerRadius.times(sine)), y: depth.minus(innerRadius.times(oneMinusCosine)) },
    })

    if (innerRadius.isGreaterThan(0)) {
      commands.push({ type: 'arcTo', point: innerEnd, radius: innerRadius, reversed: true })
    }

    return commands
  }

  private getTouchingTransitionCommands(angleFactor: BigNumber): PathCommand[] {
    const opening = this.opening
    const width = this.getOpeningWidth()
    const zero = new BigNumber(0)
    const outerRadius = new BigNumber(opening.recessOuterRadius)
    const innerRadius = new BigNumber(opening.recessInnerRadius)
    const depth = new BigNumber(opening.recessDepth)
    const radiusSum = outerRadius.plus(innerRadius)
    const innerEnd: PointSchema = {
      x: width.dividedBy(2).minus(opening.recessInnerOffset).plus(innerRadius.times(angleFactor)),
      y: depth,
    }

    // The centers are radiusSum apart. Their vertical separation is depth - radiusSum.
    // Solving for their horizontal separation keeps both radii and the inner circle unchanged.
    const centerDistanceX = depth.times(radiusSum.times(2).minus(depth)).sqrt()
    const outerStart: PointSchema = { x: innerEnd.x.minus(centerDistanceX), y: zero }
    const tangentPoint: PointSchema = {
      x: innerEnd.x.minus(centerDistanceX.times(innerRadius).dividedBy(radiusSum)),
      y: depth.times(outerRadius).dividedBy(radiusSum),
    }
    const commands: PathCommand[] = [{ type: 'moveTo', point: outerStart }]

    if (outerRadius.isGreaterThan(0)) {
      commands.push({ type: 'arcTo', point: tangentPoint, radius: outerRadius, reversed: false })
    }
    if (innerRadius.isGreaterThan(0)) {
      commands.push({ type: 'arcTo', point: innerEnd, radius: innerRadius, reversed: true })
    }

    return commands
  }

  private getSymmetricOpeningCommands(leftTransition: PathCommand[]): PathCommand[] {
    const width = this.getOpeningWidth()
    const zero = new BigNumber(0)
    const commands: PathCommand[] = [{ type: 'moveTo', point: { x: zero, y: zero } }]
    const rightTransition: PathCommand[] = []
    let previousPoint: PointSchema = { x: zero, y: zero }

    for (const command of leftTransition) {
      switch (command.type) {
        case 'moveTo':
          commands.push({ type: 'lineTo', point: command.point })
          previousPoint = command.point
          break
        case 'lineTo':
        case 'arcTo': {
          commands.push(command)
          const mirroredPoint: PointSchema = { x: width.minus(previousPoint.x), y: previousPoint.y }
          // Reflection and reversing traversal cancel each other's change of arc direction.
          rightTransition.unshift(
            narrowers.path.is.arcTo(command)
              ? { type: 'arcTo', point: mirroredPoint, radius: command.radius, reversed: command.reversed }
              : { type: 'lineTo', point: mirroredPoint },
          )
          previousPoint = command.point
          break
        }
        case 'close':
          break
      }
    }

    commands.push(
      { type: 'lineTo', point: { x: width.minus(previousPoint.x), y: previousPoint.y } },
      ...rightTransition,
      { type: 'lineTo', point: { x: width, y: zero } },
    )
    return commands
  }

  private removeZeroLengthLines(commands: PathCommand[]): PathCommand[] {
    const result: PathCommand[] = []
    let currentPoint: PointSchema | undefined

    for (const command of commands) {
      if (narrowers.path.is.close(command)) {
        result.push(command)
        continue
      }
      if (
        narrowers.path.is.lineTo(command) &&
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
}
