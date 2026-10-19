import BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'

import { ZERO } from '../../constants/layout'
import { usePath } from '../../hooks/usePath'
import { calculatePocketOpeningPath } from '../../logic/calculatePocketOpeningPath'
import type { PocketOpeningSchema, PocketOrientationSchema } from '../../schemas/components'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import { getViewBox } from '../../utils/getViewBox'

type PocketOpeningPreviewProps = {
  adjustedOpening: PocketOpeningSchema
  pocketRect: RectSchema
  orientation: PocketOrientationSchema
  width: number
  height: number
}

export const PocketOpeningPreview: FC<PocketOpeningPreviewProps> = ({
  adjustedOpening,
  pocketRect,
  orientation,
  width,
  height,
}) => {
  const normalizedRect = useMemo<RectSchema>(() => {
    const isVertical = orientation === 'up' || orientation === 'down'
    return {
      x: ZERO,
      y: ZERO,
      width: isVertical ? pocketRect.width : pocketRect.height,
      height: isVertical ? pocketRect.height : pocketRect.width,
    }
  }, [orientation, pocketRect])

  const path = useMemo<PathSchema>(
    () => calculatePocketOpeningPath(adjustedOpening, normalizedRect, 'up'),
    [adjustedOpening, normalizedRect],
  )

  const pathData = usePath(path)

  const depth = useMemo<BigNumber>(() => {
    switch (adjustedOpening.type) {
      case 'straight':
        return ZERO
      case 'recessed':
        if (adjustedOpening.depth > 0 && normalizedRect.width.dividedBy(2).isGreaterThan(adjustedOpening.outerInset)) {
          return new BigNumber(adjustedOpening.depth)
        }
        return ZERO
    }
  }, [adjustedOpening, normalizedRect.width])

  const viewBox = useMemo<string>(() => {
    const bounds: RectSchema = { x: ZERO, y: ZERO, width: normalizedRect.width, height: depth }
    const padding = Math.max(bounds.width.toNumber(), depth.toNumber(), 1) * 0.06
    return getViewBox(bounds, padding)
  }, [depth, normalizedRect.width])

  return (
    <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d={pathData} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
