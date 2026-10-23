import type { PocketClusterSchema, PocketOpeningSchema, PocketSchema } from '../../schemas/components'
import type { CornerRadiusSchema, RectSchema } from '../../schemas/geometry'
import type { PocketCalculator } from './PocketCalculator'
import { RecessedPocketCalculator } from './RecessedPocketCalculator'
import { SlantedPocketCalculator } from './SlantedPocketCalculator'
import { StraightPocketCalculator } from './StraightPocketCalculator'

export const createPocketCalculator = (
  pocket: PocketSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
  pocketRect: RectSchema,
  cornerRadius: CornerRadiusSchema,
): PocketCalculator<PocketOpeningSchema> => {
  switch (adjustedOpening.type) {
    case 'straight':
      return new StraightPocketCalculator(pocket, pocketCluster, adjustedOpening, pocketRect, cornerRadius)
    case 'recessed':
      return new RecessedPocketCalculator(pocket, pocketCluster, adjustedOpening, pocketRect, cornerRadius)
    case 'slanted':
      return new SlantedPocketCalculator(pocket, pocketCluster, adjustedOpening, pocketRect, cornerRadius)
  }
}
