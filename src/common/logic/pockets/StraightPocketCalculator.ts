import { ZERO } from '../../constants/layout'
import type { StraightPocketOpeningSchema } from '../../schemas/components'
import type { PathSchema } from '../../schemas/geometry'
import { StandardTPocketCalculator } from './StandardTPocketCalculator'

export class StraightPocketCalculator extends StandardTPocketCalculator<StraightPocketOpeningSchema> {
  getPocketOpeningPath(): PathSchema {
    return {
      commands: [
        { type: 'moveTo', point: { x: ZERO, y: ZERO } },
        { type: 'lineTo', point: { x: this.width, y: ZERO } },
      ],
    }
  }
}
