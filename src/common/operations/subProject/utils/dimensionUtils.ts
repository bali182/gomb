import BigNumber from 'bignumber.js'

import { StitchLineCommonConfigSchema } from '../../../schemas/stitching'

export const getClosestPocketStepSize = (
  preferredSize: number,
  stitchingSettings: StitchLineCommonConfigSchema,
): number => {
  return new BigNumber(preferredSize)
    .dividedBy(stitchingSettings.stitchHoleDistance)
    .integerValue(BigNumber.ROUND_CEIL)
    .times(stitchingSettings.stitchHoleDistance)
    .toNumber()
}
