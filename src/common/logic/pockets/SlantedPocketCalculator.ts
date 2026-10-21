import BigNumber from 'bignumber.js'

import { ZERO } from '../../constants/layout'
import type { SlantedPocketOpeningSchema } from '../../schemas/components'
import type { PathSchema } from '../../schemas/geometry'
import { getTPocketTabDepth } from '../pocketUtils'
import { PocketCalculator } from './PocketCalculator'

export class SlantedPocketCalculator extends PocketCalculator<SlantedPocketOpeningSchema> {
  getPocketOpeningPath(): PathSchema {
    return {
      commands: [
        { type: 'moveTo', point: { x: ZERO, y: this.getOpeningOffset(ZERO) } },
        { type: 'lineTo', point: { x: this.width, y: this.getOpeningOffset(this.width) } },
      ],
    }
  }

  getTPocketPath(): PathSchema {
    const tabDepth = getTPocketTabDepth(this.pocketCluster, this.pocketRect)
    const tabWidth = new BigNumber(this.pocketCluster.tPocketTabWidth)
    const rightInnerX = this.width.minus(tabWidth)
    return this.transformPath({
      commands: [
        ...this.getPocketOpeningPath().commands,
        { type: 'lineTo', point: { x: this.width, y: tabDepth.plus(this.getOpeningOffset(this.width)) } },
        { type: 'lineTo', point: { x: rightInnerX, y: tabDepth.plus(this.getOpeningOffset(rightInnerX)) } },
        ...this.getTPocketBottomCommands(),
        { type: 'lineTo', point: { x: tabWidth, y: tabDepth.plus(this.getOpeningOffset(tabWidth)) } },
        { type: 'lineTo', point: { x: ZERO, y: tabDepth.plus(this.getOpeningOffset(ZERO)) } },
        { type: 'close' },
      ],
    })
  }

  /** Depth of the slanted opening at this cross-axis position, measured from the original top edge. */
  private getOpeningOffset(distanceFromStart: BigNumber): BigNumber {
    if (this.width.isZero()) {
      return ZERO
    }
    const distanceFromUnchangedEnd =
      this.opening.side === 'start' ? this.width.minus(distanceFromStart) : distanceFromStart
    return distanceFromUnchangedEnd.times(this.opening.offset).dividedBy(this.width)
  }
}
