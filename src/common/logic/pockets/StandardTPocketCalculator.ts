import BigNumber from 'bignumber.js'

import { ZERO } from '../../constants/layout'
import type { PocketOpeningSchema } from '../../schemas/components'
import type { PathSchema } from '../../schemas/geometry'
import { getTPocketTabDepth } from '../pocketUtils'
import { PocketCalculator } from './PocketCalculator'

/** Openings opting into the conventional horizontal T-pocket shoulders. */
export abstract class StandardTPocketCalculator<T extends PocketOpeningSchema> extends PocketCalculator<T> {
  getTPocketPath(): PathSchema {
    if (this.pocket.type !== 't-pocket') {
      throw new Error('T-pocket path requires a T-pocket')
    }
    const tabDepth = getTPocketTabDepth(this.pocketCluster, this.pocketRect)
    const tabWidth = new BigNumber(this.pocket.tPocketTabWidth)
    return this.transformPath({
      commands: [
        ...this.getPocketOpeningPath().commands,
        { type: 'lineTo', point: { x: this.width, y: tabDepth } },
        { type: 'lineTo', point: { x: this.width.minus(tabWidth), y: tabDepth } },
        ...this.getTPocketBottomCommands(),
        { type: 'lineTo', point: { x: tabWidth, y: tabDepth } },
        { type: 'lineTo', point: { x: ZERO, y: tabDepth } },
        { type: 'close' },
      ],
    })
  }
}
